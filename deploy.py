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
BACKEND_PORT = 3003

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'tracking-otd-api')
FRONTEND_DIST = os.path.join(PROJECT_ROOT, 'kaufmann-workspace', 'dist', 'apps', 'tracking-otd')

REMOTE_BASE = '/var/www/html/otd'
REMOTE_BACKEND = f'{REMOTE_BASE}/backend'
REMOTE_FRONTEND_BROWSER = f'{REMOTE_BASE}/frontend/browser'
NGINX_CONF = '/etc/nginx/sites-available/divemotor-showroom'


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
    print("\n[1/6] Creating local tar archives...")

    backend_tar = os.path.join(PROJECT_ROOT, 'backend-deploy.tar.gz')
    frontend_tar = os.path.join(PROJECT_ROOT, 'frontend-deploy.tar.gz')

    # Backend tar: dist/ + package.json + package-lock.json
    print("  Packing backend...")
    subprocess.run(
        ['tar', 'czf', backend_tar, '-C', BACKEND_DIR,
         'dist', 'package.json', 'package-lock.json'],
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
    print("\n[2/6] Connecting to server...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASS)
    sftp = ssh.open_sftp()
    print("  Connected!")

    # Step 3: Stop backend (PID-based kill)
    print(f"\n[3/6] Stopping existing backend (port {BACKEND_PORT})...")
    out, _, _ = ssh_exec(ssh, f"ss -tlnp sport = :{BACKEND_PORT} 2>/dev/null | grep -oP 'pid=\\K[0-9]+' | head -1", check=False)
    pid = out.strip()
    if pid:
        print(f"  Killing PID {pid}...")
        ssh_exec(ssh, f"kill -9 {pid} 2>/dev/null || true", check=False)
        time.sleep(2)
    else:
        print("  No process found on port, continuing...")

    # Step 4: Upload tars
    print("\n[4/6] Uploading archives to server...")
    print("  Uploading backend tar...")
    sftp.put(backend_tar, '/tmp/backend-deploy.tar.gz')
    print("  Uploading frontend tar...")
    sftp.put(frontend_tar, '/tmp/frontend-deploy.tar.gz')
    print("  Upload complete!")

    # Step 5: Deploy backend
    print("\n[5/6] Deploying backend...")
    ssh_exec_sudo(ssh, f"chmod -R u+rwX {REMOTE_BACKEND} 2>/dev/null || true")
    ssh_exec_sudo(ssh, f"rm -rf {REMOTE_BACKEND}/dist {REMOTE_BACKEND}/node_modules")
    ssh_exec_sudo(ssh, f"mkdir -p {REMOTE_BACKEND}")
    ssh_exec_sudo(ssh, f"tar xzf /tmp/backend-deploy.tar.gz -C {REMOTE_BACKEND}")

    # Restore/create .env with correct values
    print("  Writing .env...")
    env_content = f"""NODE_ENV=production
PORT={BACKEND_PORT}
DB_HOST=172.20.200.30
DB_PORT=5432
DB_USER=appuser
DB_PASS=1q2w3e
DB_NAME=appwebdb01
DB_SSL=false
CORS_ORIGIN=http://172.20.200.30
AZURE_AD_REDIRECT_URI=http://172.20.200.30/otd/auth/microsoft/callback
AUTH_BYPASS_ENABLED=true
AUTH_BYPASS_USER_OID=00000000-0000-4000-8000-000000000001
AUTH_BYPASS_USER_EMAIL=dev@kaufmann.cl
AUTH_BYPASS_USER_NAME=Developer Kaufmann
"""
    # Write .env via heredoc
    ssh_exec_sudo(ssh, f"bash -c 'cat > {REMOTE_BACKEND}/.env << ENVEOF\n{env_content}ENVEOF'")

    # Fix ownership
    ssh_exec_sudo(ssh, f"chown -R {USER}:webdevs {REMOTE_BACKEND}")
    ssh_exec_sudo(ssh, f"chmod -R u+rwX {REMOTE_BACKEND}")

    # Install dependencies
    print("  Installing dependencies...")
    ssh_exec(ssh, f"cd {REMOTE_BACKEND} && npm install --omit=dev 2>&1 | tail -5")

    # Deploy frontend
    print("\n  Deploying frontend...")
    ssh_exec_sudo(ssh, f"chmod -R u+rwX {REMOTE_BASE}/frontend 2>/dev/null || true")
    ssh_exec_sudo(ssh, f"rm -rf {REMOTE_FRONTEND_BROWSER}")
    ssh_exec_sudo(ssh, f"mkdir -p {REMOTE_FRONTEND_BROWSER}")
    ssh_exec_sudo(ssh, f"tar xzf /tmp/frontend-deploy.tar.gz -C {REMOTE_FRONTEND_BROWSER}")
    ssh_exec_sudo(ssh, f"chown -R www-data:webdevs {REMOTE_FRONTEND_BROWSER}")
    ssh_exec_sudo(ssh, f"chmod -R 755 {REMOTE_FRONTEND_BROWSER}")
    print("  Frontend deployed!")

    # Step 6: Reload nginx + start backend
    print(f"\n[6/6] Reloading nginx and starting backend...")
    out, err, code = ssh_exec_sudo(ssh, "nginx -t 2>&1")
    if code == 0:
        print("  Nginx config OK! Reloading...")
        ssh_exec_sudo(ssh, "systemctl reload nginx")
    else:
        print("  WARNING: nginx test failed!")

    # Start backend — session may drop after this, catch it
    print("  Starting backend...")
    try:
        ssh_exec(ssh, f"rm -f /tmp/otd-backend.log", check=False)
    except Exception:
        pass
    try:
        ssh_exec(ssh, f"setsid bash -c 'cd {REMOTE_BACKEND} && node dist/main.js >> /tmp/otd-backend.log 2>&1' &", check=False)
    except Exception:
        pass

    # Cleanup tars (best effort — session may already be dead)
    try:
        ssh_exec(ssh, "rm -f /tmp/backend-deploy.tar.gz /tmp/frontend-deploy.tar.gz", check=False)
    except Exception:
        pass
    try:
        sftp.close()
    except Exception:
        pass
    try:
        ssh.close()
    except Exception:
        pass

    # Wait for backend to start, then reconnect to verify
    print("  Waiting for backend to start...")
    time.sleep(6)

    print("\n  Verifying deployment (new connection)...")
    ssh2 = paramiko.SSHClient()
    ssh2.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh2.connect(HOST, port=PORT, username=USER, password=PASS)

    def run2(cmd):
        stdin, stdout, stderr = ssh2.exec_command(cmd)
        stdout.channel.recv_exit_status()
        return stdout.read().decode('utf-8', errors='replace').strip()

    health = run2(f"curl -sf http://localhost:{BACKEND_PORT}/api/health/liveness 2>/dev/null")
    print(f"  Health: {health}")
    base = run2("grep -o 'base href=\"[^\"]*\"' /var/www/html/otd/frontend/browser/index.html 2>/dev/null")
    print(f"  Frontend: {base}")
    pid = run2(f"ss -tlnp sport = :{BACKEND_PORT} 2>/dev/null | grep -oP 'pid=\\K[0-9]+'")
    print(f"  Backend PID: {pid if pid else 'NOT RUNNING'}")

    os.remove(backend_tar)
    os.remove(frontend_tar)

    ssh2.close()

    print("\n" + "=" * 60)
    print("  DEPLOY COMPLETE!")
    print(f"  Frontend: http://172.20.200.30/otd/")
    print(f"  Backend API: http://172.20.200.30/otd/api/v1/")
    print("=" * 60)


if __name__ == '__main__':
    main()
