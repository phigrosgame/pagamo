import tkinter as tk
import pyautogui
import json
import os
from flask import Flask, request
import threading

SAVE_FILE = 'coordinates.json'

# 載入儲存的座標
if os.path.exists(SAVE_FILE):
    with open(SAVE_FILE, 'r') as f:
        coordinates = json.load(f)
else:
    coordinates = {}

# 儲存到檔案
def save_to_file():
    with open(SAVE_FILE, 'w') as f:
        json.dump(coordinates, f)

# 設定位置
def record_position(option):
    def record():
        print(f"👉 請在 3 秒內把滑鼠移到【{option}】的位置...")
        root.after(3000, lambda: save_position(option))
    return record

def save_position(option):
    x, y = pyautogui.position()
    coordinates[option] = (x, y)
    print(f"✅ 已儲存【{option}】：({x}, {y})")
    update_display()
    save_to_file()

# 測試點擊
def test_click(option):
    if option in coordinates:
        x, y = coordinates[option]
        print(f"🎯 測試點擊【{option}】：({x}, {y})")
        pyautogui.moveTo(x, y, duration=0.5)
        pyautogui.click()
    else:
        print(f"❌ 尚未設定【{option}】的座標")

# 更新顯示座標
def update_display():
    result_var.set("\n".join(f"{k}: {v}" for k, v in coordinates.items()))

# 啟動 Flask 伺服器
app = Flask(__name__)

@app.route('/click', methods=['POST'])
def handle_click():
    data = request.json
    option = data.get('option')
    if option and option in coordinates:
        threading.Thread(target=test_click, args=(option,)).start()
        return {'status': 'ok', 'clicked': option}
    else:
        return {'status': 'error', 'message': 'invalid or missing option'}, 400

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    response.headers['Access-Control-Allow-Methods'] = '*'
    return response

# GUI 主程式
root = tk.Tk()
root.title("設定答題座標 + 伺服器")
root.geometry("350x420")

tk.Label(root, text="點選按鈕，在 3 秒內把滑鼠移到對應位置").pack(pady=10)
for opt in ['A', 'B', 'C', 'next']:
    tk.Button(root, text=f"設定 {opt.upper()}", width=20, command=record_position(opt)).pack(pady=3)

tk.Label(root, text="--- 測試點擊 ---").pack(pady=(15, 5))
for opt in ['A', 'B', 'C', 'next']:
    tk.Button(root, text=f"點擊 {opt.upper()}", width=20, command=lambda o=opt: test_click(o)).pack(pady=2)

result_var = tk.StringVar()
tk.Label(root, text="目前座標：").pack(pady=(10, 0))
tk.Label(root, textvariable=result_var).pack()

update_display()

# 啟動 Flask 伺服器執行緒
def run_server():
    print("🚀 Flask API 啟動中：http://127.0.0.1:5000/click")
    app.run(host='0.0.0.0', port=5000)

threading.Thread(target=run_server, daemon=True).start()

# 啟動 GUI
root.mainloop()
