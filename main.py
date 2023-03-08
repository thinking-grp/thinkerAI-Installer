from PyQt5 import QtWidgets, uic #This installer is built using QT.
import os,zipfile,time
import tkinter as tk
from tkinter import filedialog
documents_path = os.path.join(os.path.expanduser("~"), "Documents")
app = QtWidgets.QApplication([])
window = uic.loadUi(f"lib/window.ui")
window.install_dir_input.setText(documents_path)
def out_log(text):
    log = window.install_log_output.text()
    lines = log.split("\n")  # 改行で文字列を分割し、リストにする
    if len(lines) > 35:
        lines.pop(0)  # リストの先頭を削除する
        log = "\n".join(lines)  # リストの要素を改行で結合して文字列に戻す
    out = log + "\n" + text
    window.install_log_output.setText(out)
def select_folder():
    documents_path = os.path.join(os.path.expanduser("~"), "Documents")
    root = tk.Tk()
    root.withdraw()
    print("a")
    documents_path = filedialog.askdirectory(initialdir=documents_path)
    window.install_dir_input.setText(documents_path)
    out_log("[select]"+documents_path)
def install():
    try:
        with zipfile.ZipFile("thinkerAI.zip", 'r') as zip_ref:
            file_count = len(zip_ref.namelist())
            for i, file in enumerate(zip_ref.namelist()):
                zip_ref.extract(file, os.path.join(documents_path, "thinkerAI"))
                out_log("[extract]" + file)
                window.progressBar.setValue((i + 1) * 100 / file_count)
        with zipfile.ZipFile("python.zip", 'r') as zip_ref:
            file_count = len(zip_ref.namelist())
            for i, file in enumerate(zip_ref.namelist()):
                out_log("[extract]" + file)
                window.progressBar.setValue((i + 1) * 100 / file_count)
                zip_ref.extract(file, os.path.join(documents_path, "thinkerAI","thinkerAI-develop","runtime"))
    except FileNotFoundError:
        out_log("[Error] File not found")
        return
    out_log("[extract]Finish")
    out_log("[Script]Script is running.")
    
window.install_dir_select.clicked.connect(select_folder)
window.install_button.clicked.connect(install)
if __name__ == "__main__":
    window.show()
    app.exec()
