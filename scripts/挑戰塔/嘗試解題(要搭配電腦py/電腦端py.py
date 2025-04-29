from flask import Flask, request
import pyautogui
import threading
import time

# 設定 A/B/C 對應座標
coordinates = {
    'A': (1704, 891),
    'B': (1688, 1138),
    'C': (1701, 1322)
}

# 建立 Flask 應用
app = Flask(__name__)

def click_option(option):
    option = option.upper()
    if option in coordinates:
        x, y = coordinates[option]
        print(f"🎯 準備點擊 {option}：({x}, {y})")
        pyautogui.moveTo(x, y, duration=0.3)  # 0.3秒滑過去
        pyautogui.click()
        print(f"✅ 已點選 {option} 選項！")
    else:
        print(f"❌ 收到無效選項：{option}")

@app.route('/click', methods=['POST'])
def handle_click():
    data = request.json
    option = data.get('option')
    if option:
        threading.Thread(target=click_option, args=(option,)).start()
        return {'status': 'ok', 'clicked': option}
    else:
        return {'status': 'error', 'message': 'No option provided'}, 400

# 允許CORS（跨域請求）
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    response.headers['Access-Control-Allow-Methods'] = '*'
    return response

if __name__ == '__main__':
    print("🚀 伺服器啟動中！等待網頁指令...")
    app.run(host='0.0.0.0', port=5000)
