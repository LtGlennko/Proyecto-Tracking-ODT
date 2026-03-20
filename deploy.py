"""Deploy OTD backend + frontend to remote server 172.20.200.30
Uses tar + sudo to handle permission issues.
"""
import paramiko
import os
import sys
import io
import subprocess
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

HOST = '172.20.200.30'
PORT = 22
USER = 'user_dev_ope'
PASS = 'IjDuk2vmGLl#'

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'tracking-otd-api')
FRONTEND_DIST = os.path.join(PROJECT_ROOT, 'kaufmann-workspace', 'dist', 'apps', 'tracking-otd')

REMOTE_BASE = '/var/www/html/otd'
REMOTE_BACKEND = f'{REMOTE_BASE}/backend'
REMOTE_FRONTEND_BROWSER = f'{REMOTE_BASE}/frontend/browser'


def ssh_exec(ssh, cmd, check=True):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if out:
        print(f"  {out}")
    if err and exit_code != 0:
        print(f"  ERR: {err}")
    if check and exit_code != 0:
        print(f"  [exit {exit_code}]")
    return out, err, exit_code


def ssh_exec_sudo(ssh, cmd):
    """Execute command with sudo, providing password via stdin"""
    full_cmd = f"echo '{PASS}' | sudo -S {cmd}"
    return ssh_exec(ssh, full_cmd, check=True)


def main():
    print("=" * 60)
    print("  DEPLOY OTD -> 172.20.200.30")
    print("=" * 60)

    # Step 1: Create tar archives locally
    print("\n[1/7] Creating local tar archives...")

    backend_tar = os.path.join(PROJECT_ROOT, 'backend-deploy.tar.gz')
    frontend_tar = os.path.join(PROJECT_ROOT, 'frontend-deploy.tar.gz')

    # Backend tar: dist/ + package.json + package-lock.json + .env + seeds/
    print("  Packing backend...")
    subprocess.run(
        ['tar', 'czf', backend_tar, '-C', BACKEND_DIR,
         'dist', 'package.json', 'package-lock.json', '.env', 'seeds'],
        check=True, capture_output=True
    )
    backend_size = os.path.getsize(backend_tar) / 1024 / 1024
    print(f"  backend-deploy.tar.gz ({backend_size:.1f} MB)")

    # Frontend tar
    print("  Packing frontend...")
    subprocess.run(
        ['tar', 'czf', frontend_tar, '-C', FRONTEND_DIST, '.'],
        check=True, capture_output=True
    )
    frontend_size = os.path.getsize(frontend_tar) / 1024 / 1024
    print(f"  frontend-deploy.tar.gz ({frontend_size:.1f} MB)")

    # Step 2: Connect
    print("\n[2/7] Connecting to server...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASS)
    sftp = ssh.open_sftp()
    print("  Connected!")

    # Step 3: Stop backend
    print("\n[3/7] Stopping existing backend...")
    ssh_exec_sudo(ssh, "pkill -f 'node dist/main.js' || true")
    time.sleep(2)
    print("  Done.")

    # Step 4: Upload tars to /tmp
    print("\n[4/7] Uploading archives to server...")
    print("  Uploading backend tar...")
    sftp.put(backend_tar, '/tmp/backend-deploy.tar.gz')
    print("  Uploading frontend tar...")
    sftp.put(frontend_tar, '/tmp/frontend-deploy.tar.gz')
    print("  Upload complete!")

    # Step 5: Extract backend
    print("\n[5/7] Deploying backend...")
    ssh_exec_sudo(ssh, f"chmod -R u+rwX {REMOTE_BACKEND} 2>/dev/null || true")
    ssh_exec_sudo(ssh, f"rm -rf {REMOTE_BACKEND}/dist {REMOTE_BACKEND}/node_modules")
    ssh_exec_sudo(ssh, f"mkdir -p {REMOTE_BACKEND}")
    ssh_exec_sudo(ssh, f"tar xzf /tmp/backend-deploy.tar.gz -C {REMOTE_BACKEND}")

    # Update .env for staging
    print("  Updating .env for staging...")
    ssh_exec_sudo(ssh, f"sed -i 's|^CORS_ORIGIN=.*|CORS_ORIGIN=http://172.20.200.30|' {REMOTE_BACKEND}/.env")
    ssh_exec_sudo(ssh, f"sed -i 's|^NODE_ENV=.*|NODE_ENV=production|' {REMOTE_BACKEND}/.env")
    ssh_exec_sudo(ssh, f"sed -i 's|^PORT=.*|PORT=3001|' {REMOTE_BACKEND}/.env")

    # Fix ownership so current user can run npm install
    ssh_exec_sudo(ssh, f"chown -R {USER}:webdevs {REMOTE_BACKEND}")
    ssh_exec_sudo(ssh, f"chmod -R u+rwX {REMOTE_BACKEND}")

    # Install dependencies
    print("  Installing dependencies (npm ci)...")
    out, err, code = ssh_exec(ssh, f"cd {REMOTE_BACKEND} && npm ci --omit=dev 2>&1 | tail -10")
    if code != 0:
        print("  Trying npm install --production...")
        ssh_exec(ssh, f"cd {REMOTE_BACKEND} && npm install --production 2>&1 | tail -10")

    # Step 6: Extract frontend
    print("\n[6/7] Deploying frontend...")
    ssh_exec_sudo(ssh, f"chmod -R u+rwX {REMOTE_BASE}/frontend 2>/dev/null || true")
    ssh_exec_sudo(ssh, f"rm -rf {REMOTE_FRONTEND_BROWSER}")
    ssh_exec_sudo(ssh, f"mkdir -p {REMOTE_FRONTEND_BROWSER}")
    ssh_exec_sudo(ssh, f"tar xzf /tmp/frontend-deploy.tar.gz -C {REMOTE_FRONTEND_BROWSER}")
    ssh_exec_sudo(ssh, f"chown -R www-data:webdevs {REMOTE_FRONTEND_BROWSER}")
    ssh_exec_sudo(ssh, f"chmod -R 755 {REMOTE_FRONTEND_BROWSER}")
    print("  Frontend deployed!")

    # Step 7: Nginx + start backend
    print("\n[7/7] Configuring nginx and starting backend...")

    # Check if OTD config exists
    out, _, _ = ssh_exec(ssh, "grep -c 'OTD Tracking' /etc/nginx/sites-available/default 2>/dev/null || echo 0")
    needs_nginx = out.strip() == '0'

    if needs_nginx:
        print("  Adding OTD location blocks to nginx...")
        nginx_block = r"""
    # --- OTD Tracking App ---
    location /otd/ {
        alias /var/www/html/otd/frontend/browser/;
        try_files $uri $uri/ /otd/index.html;
    }

    location /otd/api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    # --- End OTD ---
"""
        # Write nginx snippet to temp file, then insert before last }
        ssh_exec(ssh, f"cat > /tmp/otd-nginx-block.conf << 'NGINXEOF'\n{nginx_block}\nNGINXEOF")

        # Read current default, insert block before last closing brace
        ssh_exec_sudo(ssh,
            "cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak")
        ssh_exec_sudo(ssh,
            r"""python3 -c "
import re
with open('/etc/nginx/sites-available/default') as f:
    content = f.read()
with open('/tmp/otd-nginx-block.conf') as f:
    block = f.read()
# Insert before the last closing brace
last_brace = content.rfind('}')
new_content = content[:last_brace] + block + '\n}\n'
with open('/tmp/nginx-default-new', 'w') as f:
    f.write(new_content)
" """)
        ssh_exec_sudo(ssh, "cp /tmp/nginx-default-new /etc/nginx/sites-available/default")
    else:
        print("  OTD nginx config already exists. Updating...")
        ssh_exec_sudo(ssh,
            r"""python3 -c "
import re
with open('/etc/nginx/sites-available/default') as f:
    content = f.read()
# Remove old OTD block
content = re.sub(r'\n\s*# --- OTD Tracking App ---.*?# --- End OTD ---\n', '\n', content, flags=re.DOTALL)
block = '''
    # --- OTD Tracking App ---
    location /otd/ {
        alias /var/www/html/otd/frontend/browser/;
        try_files \\\$uri \\\$uri/ /otd/index.html;
    }

    location /otd/api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
    }
    # --- End OTD ---
'''
last_brace = content.rfind('}')
new_content = content[:last_brace] + block + '\n}\n'
with open('/tmp/nginx-default-new', 'w') as f:
    f.write(new_content)
" """)
        ssh_exec_sudo(ssh, "cp /tmp/nginx-default-new /etc/nginx/sites-available/default")

    # Test and reload nginx
    print("  Testing nginx config...")
    out, err, code = ssh_exec_sudo(ssh, "nginx -t 2>&1")
    if 'successful' in (out + err).lower() or code == 0:
        print("  Nginx OK! Reloading...")
        ssh_exec_sudo(ssh, "systemctl reload nginx")
    else:
        print("  WARNING: nginx test failed!")
        ssh_exec(ssh, "cat /etc/nginx/sites-available/default")

    # Start backend
    print("\n  Starting backend...")
    ssh_exec(ssh, f"cd {REMOTE_BACKEND} && nohup node dist/main.js > /tmp/otd-backend.log 2>&1 &")
    time.sleep(4)

    # Verify
    print("\n  Verifying deployment...")
    ssh_exec(ssh, "curl -sf http://localhost:3001/api/health/liveness 2>/dev/null && echo 'Backend: OK' || echo 'Backend: NOT RESPONDING'")
    ssh_exec(ssh, "curl -sf -o /dev/null -w '%{http_code}' http://localhost/otd/ 2>/dev/null && echo ' Frontend: OK' || echo 'Frontend: check nginx'")
    ssh_exec(ssh, "ps aux | grep 'otd.*main.js' | grep -v grep | head -1")

    # Cleanup
    ssh_exec(ssh, "rm -f /tmp/backend-deploy.tar.gz /tmp/frontend-deploy.tar.gz /tmp/otd-nginx-block.conf /tmp/nginx-default-new")
    os.remove(backend_tar)
    os.remove(frontend_tar)

    sftp.close()
    ssh.close()

    print("\n" + "=" * 60)
    print("  DEPLOY COMPLETE!")
    print(f"  Frontend: http://172.20.200.30/otd/")
    print(f"  Backend API: http://172.20.200.30/otd/api/")
    print(f"  Health: http://172.20.200.30/otd/api/health/liveness")
    print("=" * 60)


if __name__ == '__main__':
    main()
