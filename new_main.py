import os
import platform
import ctypes
import sys
import subprocess
import eel
"""
仮置き:

EELを使用 (最近のバージョンはWebView2 または インストール済みブラウザを使用)
Github Actionsの構成の変更なしで動作するようある程度互換性を持たせる
"""

class admin:
    def __init__(self):
        self.is_admin = False
        self.run_as_admin = False

    def check_admin(self):
        system = platform.system()
        if system == "Windows":
            try:
                self.is_admin = ctypes.windll.shell32.IsUserAnAdmin() != 0
            except:
                self.is_admin = False
        elif system == "Linux" or system == "Darwin":  # Darwin is macOS
            self.is_admin = os.geteuid() == 0
        else:
            raise NotImplementedError(f"Unsupported platform: {system}")
    
    def run_as_admin(self):
        system = platform.system()
        if system == "Windows":
            if self.is_admin:
                return True

            script = sys.argv[0]
            params = ' '.join(sys.argv[1:])
            try:
                subprocess.check_call(['runas', '/noprofile', '/user:Administrator', sys.executable, script] + sys.argv[1:])
            except subprocess.CalledProcessError:
                return False

            sys.exit(0)
        else:
            return True

eel = eel.init('web', allowed_extensions=['.js', '.html', '.css'])
    

if __name__ == "__main__":
    admin = admin()
    if not admin.check_admin():
        if not admin.run_as_admin():
            print('管理者権限で実行されていません。このスクリプトを管理者権限で実行してください。')
            sys.exit(1)
    
    

