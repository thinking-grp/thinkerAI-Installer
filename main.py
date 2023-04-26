import os
import subprocess
import sys
import threading
import time
import tkinter as tk
import zipfile
import ctypes
from tkinter import filedialog
from typing import List
root = tk.Tk()
root.withdraw()
from PyQt5 import QtWidgets, uic
from PyQt5.QtCore import QThread, pyqtSignal


def is_admin():
    if os.name == 'nt':
        try:
            return ctypes.windll.shell32.IsUserAnAdmin()
        except:
            return False
    else:
        return os.getuid() == 0

def run_as_admin():
    if os.name == 'nt':
        if is_admin():
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

def resource_path(relative_path):
    """ PyInstallerでパッケージングされたアプリケーションでファイルパスを取得する """
    if hasattr(sys, '_MEIPASS'):
        # PyInstallerでパッケージングされた場合
        base_path = sys._MEIPASS
    else:
        # 通常の実行の場合
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)
if not is_admin():
    if not run_as_admin():
        print('管理者権限で実行されていません。このスクリプトを管理者権限で実行してください。')
        sys.exit(1)

app = QtWidgets.QApplication(sys.argv)
window = uic.loadUi(resource_path("lib/window.ui"))
WILL_INSTALL_PATH = os.path.join(os.path.expanduser("~"), "Documents")
window.install_dir_input.setText(WILL_INSTALL_PATH)


class ExtractThread(QThread):
    progress_signal = pyqtSignal(int)
    out_log = pyqtSignal(str)

    def __init__(self, parent=None):
        super().__init__(parent)

    def run(self):
        try:
            if os.name == "nt":
                self.out_log.emit("[setting]Variables are set for Windows")
                sh = ".\\install-win32-x64.bat"
            else:
                self.out_log.emit(
                    "[setting]Variables are set for Unix-like OS")
                sh = "./install-darwin-x64.sh"
            with zipfile.ZipFile(os.path.join(resource_path("assets"), "thinkerAI.zip"), 'r') as zip_ref:
                file_count = len(zip_ref.namelist())
                for i, file in enumerate(zip_ref.namelist()):
                    zip_ref.extract(file, os.path.join(
                        WILL_INSTALL_PATH, "thinkerAI","thinkerAI"))
                    self.progress_signal.emit((i + 1) * 200 // file_count)
                    self.out_log.emit(file)
            if os.name == "nt":
                with zipfile.ZipFile(os.path.join(resource_path("assets"), "python.zip"), 'r') as zip_ref:
                    file_count = len(zip_ref.namelist())
                    for i, file in enumerate(zip_ref.namelist()):
                        zip_ref.extract(file, os.path.join(
                            WILL_INSTALL_PATH, "thinkerAI", "thinkerAI", "runtimes", "python"))
                        self.progress_signal.emit((i + 1) * 200 // file_count)
                        self.out_log.emit(file)

            self.out_log.emit("[extract]Finish")

            try:
                subprocess.check_output(sh, shell=True, stderr=subprocess.STDOUT, universal_newlines=True, cwd=os.path.join(
                    WILL_INSTALL_PATH, "thinkerAI", "thinkerAI"))
            except subprocess.CalledProcessError as e:
                self.out_log.emit(
                    f"[Error] Script failed with exit code {e.returncode}: {e.output.strip()}")

            else:
                self.out_log.emit("[Script] Script completed successfully.")
                self.out_log.emit("[Success] Installation completed.")

        except Exception as e:
            self.out_log.emit(f"[Error] {str(e)}")
        finally:
            self.wait()


def select_folder():
    global WILL_INSTALL_PATH
    selected_folder = filedialog.askdirectory(initialdir=WILL_INSTALL_PATH)
    WILL_INSTALL_PATH = selected_folder
    window.install_dir_input.setText(selected_folder)
    out_log(f"[select] {selected_folder}")


def out_log(text: str) -> None:
    try:
        window.install_log_output.append(text)
        window.install_log_output.verticalScrollBar().setValue(
            window.install_log_output.verticalScrollBar().maximum())
    except Exception as e:
        error_dialog = QtWidgets.QErrorMessage()
        error_dialog.showMessage(f"An error occurred: {str(e)}")
        error_dialog.exec_()


def install() -> None:
    try:
        window.install_button.setEnabled(False)
        thread = ExtractThread()
        thread.progress_signal.connect(window.progressBar.setValue)
        thread.out_log.connect(out_log)
        thread.run()
    except Exception as e:
        error_dialog = QtWidgets.QErrorMessage()
        error_dialog.showMessage(f"An error occurred: {str(e)}")
        error_dialog.exec_()


window.install_dir_select.clicked.connect(select_folder)
window.install_button.clicked.connect(install)
window.install_log_output.setReadOnly(True)

if __name__ == "__main__":
    try:
        window.show()
        sys.exit(app.exec_())
    except Exception as e:
        print(e)
        error_dialog = QtWidgets.QErrorMessage()
        error_dialog.showMessage(f"An error occurred: {str(e)}")
        error_dialog.exec_()
