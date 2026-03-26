"""Deploy OTD backend + frontend to remote server 172.20.200.30"""
import paramiko
import os
import subprocess
import time
import sys

# Flush output immediately
sys.stdout.reconfigure(line_buffering=True)

HOST = '172.20.200.30'
PORT = 22
USER = 'user_dev_ope'
PASS = 'IjDuk2vmGLl#'
BACKEND_PORT = 3003

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR  = os.path.join(PROJECT_ROOT, 'tracking-otd-api')
FRONTEND_DIR = os.path.join(PROJECT_ROOT, 'kaufmann-workspace')
FRONTEND_DIST = os.path.join(FRONTEND_DIR, 'dist', 'apps', 'tracking-otd')

REMOTE_BACKEND        = '/var/www/html/otd/backend'
REMOTE_FRONTEND_BROWSER = '/var/www/html/otd/frontend/browser'

ENV_CONTENT = f"""NODE_ENV=production
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
AUTH_BYPASS_USER_NAME=Developer Kaufmann"""


def ssh_run(ssh, cmd, timeout=120):
    _, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    stdout.channel.recv_exit_status()
    return stdout.read().decode('utf-8', errors='replace').strip()


def ssh_sudo(ssh, cmd, timeout=120):
    return ssh_run(ssh, f"echo '{PASS}' | sudo -S {cmd}", timeout=timeout)


def build_all():
    print("[1/2] Building backend (NestJS)...")
    result = subprocess.run(
        'npm run build', shell=True, cwd=BACKEND_DIR,
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"  ERROR: {result.stderr[-300:]}")
        sys.exit(1)
    print("  Backend OK")

    print("[2/2] Building frontend (Angular staging)...")
    result = subprocess.run(
        'npx nx build tracking-otd --configuration=staging --skip-nx-cache',
        shell=True, cwd=FRONTEND_DIR,
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"  ERROR: {result.stderr[-300:]}")
        sys.exit(1)
    print("  Frontend OK")


def main():
    print("=" * 60)
    print("  DEPLOY OTD -> 172.20.200.30")
    print("=" * 60)

    # ── Build ──────────────────────────────────────────────────
    build_all()

    # ── Pack ──────────────────────────────────────────────────
    print("\n[3] Packing archives...")
    bt = os.path.join(PROJECT_ROOT, '_backend-deploy.tar.gz')
    ft = os.path.join(PROJECT_ROOT, '_frontend-deploy.tar.gz')
    subprocess.run(
        ['tar', 'czf', bt, '-C', BACKEND_DIR, 'dist', 'package.json', 'package-lock.json'],
        check=True, capture_output=True
    )
    subprocess.run(
        ['tar', 'czf', ft, '-C', FRONTEND_DIST, '.'],
        check=True, capture_output=True
    )
    print(f"  BE: {os.path.getsize(bt)/1024/1024:.1f} MB  FE: {os.path.getsize(ft)/1024/1024:.1f} MB")

    # ── Connect ────────────────────────────────────────────────
    print("\n[4] Connecting to server...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
    sftp = ssh.open_sftp()
    print("  Connected!")

    # ── Kill existing backend ──────────────────────────────────
    print(f"\n[5] Stopping backend (port {BACKEND_PORT})...")
    pid = ssh_run(ssh, f"ss -tlnp sport = :{BACKEND_PORT} 2>/dev/null | grep -oP 'pid=\\K[0-9]+' | head -1")
    if pid:
        ssh_run(ssh, f"kill -9 {pid} 2>/dev/null || true")
        time.sleep(2)
        print(f"  Killed PID {pid}")
    else:
        print("  No process found, continuing...")

    # ── Upload ─────────────────────────────────────────────────
    print("\n[6] Uploading archives...")
    sftp.put(bt, '/tmp/backend-deploy.tar.gz')
    sftp.put(ft, '/tmp/frontend-deploy.tar.gz')
    print("  Done!")

    # ── Deploy backend ─────────────────────────────────────────
    print("\n[7] Deploying backend...")
    ssh_sudo(ssh, f"rm -rf {REMOTE_BACKEND}/dist {REMOTE_BACKEND}/node_modules")
    ssh_sudo(ssh, f"tar xzf /tmp/backend-deploy.tar.gz -C {REMOTE_BACKEND}")
    ssh_sudo(ssh, f"bash -c 'printf \"%s\" \"{ENV_CONTENT}\" > {REMOTE_BACKEND}/.env'")
    ssh_sudo(ssh, f"chown -R {USER}:webdevs {REMOTE_BACKEND}")
    ssh_sudo(ssh, f"chmod -R u+rwX {REMOTE_BACKEND}")
    out = ssh_run(ssh, f"cd {REMOTE_BACKEND} && npm install --omit=dev 2>&1 | tail -3", timeout=180)
    if out:
        print(f"  {out}")

    # ── Deploy frontend ────────────────────────────────────────
    print("\n[8] Deploying frontend...")
    ssh_sudo(ssh, f"rm -rf {REMOTE_FRONTEND_BROWSER}")
    ssh_sudo(ssh, f"mkdir -p {REMOTE_FRONTEND_BROWSER}")
    ssh_sudo(ssh, f"tar xzf /tmp/frontend-deploy.tar.gz -C {REMOTE_FRONTEND_BROWSER}")
    ssh_sudo(ssh, f"chown -R www-data:webdevs {REMOTE_FRONTEND_BROWSER}")
    ssh_sudo(ssh, "chmod -R 755 /var/www/html/otd/frontend/browser")
    print("  Done!")

    # ── Reload nginx ───────────────────────────────────────────
    print("\n[9] Reloading nginx...")
    ssh_sudo(ssh, "systemctl reload nginx")

    # ── Start backend ──────────────────────────────────────────
    print("\n[10] Starting backend...")
    try:
        ssh_run(ssh, "rm -f /tmp/otd-backend.log")
    except Exception:
        pass
    try:
        ssh_run(ssh, f"setsid bash -c 'cd {REMOTE_BACKEND} && node dist/main.js >> /tmp/otd-backend.log 2>&1' &")
    except Exception:
        pass
    try:
        ssh_run(ssh, "rm -f /tmp/backend-deploy.tar.gz /tmp/frontend-deploy.tar.gz")
    except Exception:
        pass
    try:
        sftp.close()
        ssh.close()
    except Exception:
        pass

    # ── Verify ─────────────────────────────────────────────────
    print("  Waiting 7s for startup...")
    time.sleep(7)

    ssh2 = paramiko.SSHClient()
    ssh2.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh2.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

    def r2(cmd):
        _, so, _ = ssh2.exec_command(cmd)
        so.channel.recv_exit_status()
        return so.read().decode('utf-8', errors='replace').strip()

    health = r2(f"curl -sf http://localhost:{BACKEND_PORT}/api/health/liveness 2>/dev/null")
    base   = r2("grep -o 'base href=\"[^\"]*\"' /var/www/html/otd/frontend/browser/index.html 2>/dev/null")
    pid2   = r2(f"ss -tlnp sport = :{BACKEND_PORT} 2>/dev/null | grep -oP 'pid=\\K[0-9]+'")
    ssh2.close()

    # Cleanup local tars
    os.remove(bt)
    os.remove(ft)

    print(f"\n  Health : {health}")
    print(f"  Frontend: {base}")
    print(f"  PID     : {pid2 or 'NOT RUNNING ⚠'}")

    if not pid2:
        print("\n  ERROR: Backend did not start! Check /tmp/otd-backend.log on server.")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("  DEPLOY COMPLETE!")
    print(f"  http://172.20.200.30/otd/")
    print("=" * 60)


if __name__ == '__main__':
    main()
