import os
import subprocess
import sys
import threading
import time
import tkinter as tk
import zipfile

from tkinter import filedialog
from typing import List

from PyQt5 import QtWidgets, uic
from PyQt5.QtCore import QThread, pyqtSignal


app = QtWidgets.QApplication(sys.argv)
window = uic.loadUi("lib/window.ui")

DOCUMENTS_PATH = os.path.join(os.path.expanduser("~"), "Documents")
window.install_dir_input.setText(DOCUMENTS_PATH)


class ExtractThread(QThread):
    progress_signal = pyqtSignal(int)
    out_log = pyqtSignal(str)

    def __init__(self, parent=None):
        super().__init__(parent)

    def run(self):
        print("a")
        try:
            with zipfile.ZipFile(os.path.join(os.getcwd(), "thinkerAI.zip"), 'r') as zip_ref:
                file_count = len(zip_ref.namelist())
                for i, file in enumerate(zip_ref.namelist()):
                    zip_ref.extract(file, os.path.join(DOCUMENTS_PATH, "thinkerAI"))
                    self.progress_signal.emit((i + 1) * 200 // file_count)
                    self.out_log.emit(file)
            with zipfile.ZipFile(os.path.join(os.getcwd(), "python.zip"), 'r') as zip_ref:
                file_count = len(zip_ref.namelist())
                for i, file in enumerate(zip_ref.namelist()):
                    zip_ref.extract(file, os.path.join(DOCUMENTS_PATH, "thinkerAI", "thinkerAI-develop", "runtimes", "python"))
                    self.progress_signal.emit((i + 1) * 200 // file_count)
                    self.out_log.emit(file)

            self.out_log.emit("[extract]Finish")

            try:
                subprocess.check_output('install-win32-x64.bat', shell=True, stderr=subprocess.STDOUT, universal_newlines=True,cwd=os.path.join(DOCUMENTS_PATH, "thinkerAI","thinkerAI-develop"))
            except subprocess.CalledProcessError as e:
                self.out_log.emit(f"[Error] Script failed with exit code {e.returncode}: {e.output.strip()}")

            else:
                self.out_log.emit("[Script] Script completed successfully.")
                self.out_log.emit("[Success] Installation completed.")

        except Exception as e:
            self.out_log.emit(f"[Error] {str(e)}")


def select_folder() -> None:
    global DOCUMENTS_PATH

    root = tk.Tk()
    root.withdraw()

    selected_folder = filedialog.askdirectory(initialdir=DOCUMENTS_PATH)
    DOCUMENTS_PATH = selected_folder
    window.install_dir_input.setText(selected_folder)
    out_log(f"[select] {selected_folder}")


def out_log(text: str) -> None:
    try:
        window.install_log_output.append(text)
        window.install_log_output.verticalScrollBar().setValue(window.install_log_output.verticalScrollBar().maximum())
    except Exception as e:
        # 例外をキャッチしてエラーダイアログに表示する
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
        # 例外をキャッチしてエラーダイアログに表示する
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
        # 例外をキャッチしてエラーダイアログに表示する
        print(e)
        error_dialog = QtWidgets.QErrorMessage()
        error_dialog.showMessage(f"An error occurred: {str(e)}")
        error_dialog.exec_()
