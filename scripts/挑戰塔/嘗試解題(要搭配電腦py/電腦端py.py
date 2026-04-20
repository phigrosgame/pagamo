import tkinter as tk
import pyautogui
import json
import os
from flask import Flask, request
import threading

# --- 極速優化設定 ---
pyautogui.PAUSE = 0  # 移除指令間的預設延遲
pyautogui.FAILSAFE = True # 保持安全機制，滑鼠移至角落可停止

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

# 極速點擊執行
def fast_click(option):
    if option in coordinates:
        x, y = coordinates[option]
        # 使用 duration=0 達到瞬間移動，並立即執行 click
        pyautogui.click(x, y) 
        print(f"⚡ 極速點擊【{option}】：({x}, {y})")
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
        # 直接執行，減少 Thread 創建開銷，或保持 Thread 以免阻塞 Flask
        threading.Thread(target=fast_click, args=(option,)).start()
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
root.title("極速答題座標伺服器")
root.geometry("350x420")

tk.Label(root, text="設定按鈕：3秒內移動滑鼠至目標位置").pack(pady=10)
for opt in ['A', 'B', 'C', 'next']:
    tk.Button(root, text=f"設定 {opt.upper()}", width=20, command=record_position(opt)).pack(pady=3)

tk.Label(root, text="--- 手動測試 ---").pack(pady=(15, 5))
for opt in ['A', 'B', 'C', 'next']:
    tk.Button(root, text=f"測試 {opt.upper()}", width=20, command=lambda o=opt: fast_click(o)).pack(pady=2)

result_var = tk.StringVar()
tk.Label(root, text="目前儲存座標：").pack(pady=(10, 0))
tk.Label(root, textvariable=result_var).pack()

update_display()

# 啟動 Flask 伺服器執行緒
def run_server():
    print("🚀 極速 API 啟動：http://127.0.0.1:5000/click")
    # 使用 threaded=True 增加 Flask 並行處理能力
    app.run(host='0.0.0.0', port=5000, threaded=True, debug=False)

threading.Thread(target=run_server, daemon=True).start()

# 啟動 GUI
root.mainloop()
