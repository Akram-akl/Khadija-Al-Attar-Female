import paramiko
import os
import sys

VPS_IP = "145.223.85.116"
VPS_USER = "root"
VPS_PASS = "akram@198@H2009"

def apply_female_remote():
    print("=" * 60)
    print(" 🌸 Khadija Al-Attar Female - Hostinger VPS Schema Applier")
    print("    تطبيق سكيما الحلقات النسائية على قاعدة البيانات المستقلة")
    print("=" * 60)

    local_dir = os.path.dirname(os.path.abspath(__file__))
    local_sql = os.path.join(local_dir, "init.sql")
    if not os.path.exists(local_sql):
        print(f"❌ ERROR: init.sql not found at: {local_sql}")
        sys.exit(1)

    try:
        print(f"\n[1/3] Connecting to VPS ({VPS_IP})...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS, timeout=10)
        sftp = ssh.open_sftp()

        print("[2/3] Uploading female init.sql to VPS...")
        remote_sql = "/root/female_init.sql"
        sftp.put(local_sql, remote_sql)
        sftp.close()

        print("[3/3] Applying female schema to quran_female_db...")
        cmd_apply = 'docker exec -i quran_postgres psql -U postgres -d quran_female_db < /root/female_init.sql'
        stdin, stdout, stderr = ssh.exec_command(cmd_apply)
        exit_status = stdout.channel.recv_exit_status()

        if exit_status == 0:
            print("✅ Successfully applied female schema to quran_female_db!")
        else:
            print(f"❌ Error applying schema: {stderr.read().decode()}")

        ssh.close()
    except Exception as e:
        print(f"❌ Connection error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    apply_female_remote()
