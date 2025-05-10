
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

options = Options()
options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")

# 連接到已經啟動的 Chrome 實例
driver = webdriver.Chrome(options=options)

from selenium.webdriver.common.by import By
import time
import json

# 初始化 WebDriver

def sleep(ms):
    time.sleep(ms / 1000)  # 轉換為秒

def match_answer():
    try:
        div = driver.find_element(By.CSS_SELECTOR, '.question-iframe-container.pgo-style-question-content-wrapper-DprzUI')
    except:
        print('❌ 找不到題目區域')
        trigger_next()
        return

    question_text = div.get_attribute('innerHTML').replace('<br>', '\n').replace('</?[^>]+(>|$)', "").strip()
    img = div.find_element(By.TAG_NAME, 'img') if div.find_elements(By.TAG_NAME, 'img') else None
    img_url = img.get_attribute('src') if img else None

    print('📝 當前題目:', question_text)
    print('🖼️ 當前圖片:', img_url)

    quiz_data = json.loads(driver.execute_script("return localStorage.getItem('quizData')")) or []
    option_divs = driver.find_elements(By.CSS_SELECTOR, '.question-iframe-container.pgo-style-selection-31EiFh')
    current_options = [option.text.strip() for option in option_divs]

    matched_quiz = None

    for item in quiz_data:
        if item['question']['text'] == question_text and item['question']['img'] == img_url:
            matched = any(opt in current_options for opt in item['correctOptions'])
            if matched:
                matched_quiz = item
                break

    if not matched_quiz:
        print('❌ 找不到完全符合的 quizData')
        trigger_next()
        return

    print('🎯 確認找到 quizData：', matched_quiz)

    clicked = False

    for option_div in option_divs:
        option_text = option_div.find_element(By.CSS_SELECTOR, '.pgo-style-selection-content-1x0d36').text.strip()
        choice_letter = option_div.find_element(By.CSS_SELECTOR, '.pgo-style-selection-choice-zKJKfo').text.strip()

        if option_text and choice_letter and choice_letter not in ['A', 'B', 'C', 'D']:
            continue

        if option_text in matched_quiz['correctOptions'] and not clicked:
            clicked = True
            driver.execute_script(f"fetch('http://127.0.0.1:5000/click', {{ method: 'POST', headers: {{ 'Content-Type': 'application/json' }}, body: JSON.stringify({{ option: '{choice_letter}' }}) }})")
            print(f"📡 Python回應: 點擊了選項 {choice_letter}")
            sleep(120)  # 等待下一題
            trigger_next()

    if not clicked:
        print("❌ 無法對應正確選項")
        trigger_next()

def trigger_next():
    try:
        submit_button = driver.find_element(By.CSS_SELECTOR, '#answer-panel-submit-button')
        if submit_button.text.strip() == '送出':
            print('✅ 找到「送出」按鈕')
            submit_button.click()
            print('✅ 點擊了「送出」或「下一題」按鈕')

            time.sleep(120)
            confirm_submit_button = driver.find_element(By.CSS_SELECTOR, 'button[data-version="default"][data-size="small"][data-color="green"]')
            if confirm_submit_button:
                confirm_submit_button.click()
                print('✅ 點擊了「直接送出」按鈕')
            else:
                print('❌ 找不到「直接送出」按鈕')

            return
    except Exception as e:
        print("❌ 找不到送出按鈕", e)

    driver.execute_script("fetch('http://127.0.0.1:5000/click', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({option: 'next'})})")
    print("➡️ 已送出下一題")
    sleep(120)
    match_answer()

def grab_question():
    div = driver.find_element(By.CSS_SELECTOR, '.question-iframe-container.pgo-style-question-content-wrapper-DprzUI')
    question_text = ''
    img_url = ''

    if div:
        question_text = div.get_attribute('innerHTML').replace('<br>', '\n').replace('</?[^>]+(>|$)', "").strip()
        img = div.find_element(By.TAG_NAME, 'img') if div.find_elements(By.TAG_NAME, 'img') else None
        img_url = img.get_attribute('src') if img else None

    correct_options = []
    correct_divs = driver.find_elements(By.CSS_SELECTOR, 'div[data-correct="true"]')
    for option in correct_divs:
        option_text = option.find_element(By.CSS_SELECTOR, '.pgo-style-selection-content-1x0d36').text.strip()
        if option_text:
            correct_options.append(option_text)

    if not question_text and not correct_options:
        print('⚠️ 沒有找到題目或答案')
        return

    new_result = {
        'question': {
            'text': question_text,
            'img': img_url or None
        },
        'correctOptions': correct_options or None
    }

    existing_data = json.loads(driver.execute_script("return localStorage.getItem('quizData')"))
    if not isinstance(existing_data, list):
        existing_data = []

    is_duplicate = any(item['question']['text'] == new_result['question']['text'] and json.dumps(item['correctOptions']) == json.dumps(new_result['correctOptions']) for item in existing_data)

    if not is_duplicate:
        existing_data.append(new_result)
        driver.execute_script(f"localStorage.setItem('quizData', '{json.dumps(existing_data)}')")
        print('✅ 新資料已存入 localStorage')
    else:
        print('🔁 重複的資料，不存')

def repeat_flow(times=100):
    for i in range(1, times + 1):
        print(f"🎯 第 {i} 次流程開始")
        retry_button = driver.find_element(By.XPATH, '//button[.//span[contains(text(), "再試一次")]]')

        score_span = driver.find_element(By.CSS_SELECTOR, 'span.pgo-style-number-_ff4Au')
        score = int(score_span.text.strip()) if score_span else 0

        print(f"📊 當前得分: {score}")

        if score < 18:
            print('❌ 分數不滿 18，進行 autoFlow()')
            grab_question()
            retry_button.click()
            sleep(300)
            match_answer()
            sleep(6500)
        else:
            print('✅ 分數達標，檢查門票是否大於 0')

            ticket_div = driver.find_element(By.CSS_SELECTOR, 'div.pgo-style-tickets-count-6OaTMF')
            ticket_count = int(ticket_div.text.strip()) if ticket_div else 0

            if ticket_count > 0:
                print(f"🎫 有 {ticket_count} 張門票，點擊『下一關』")
                next_stage_button = driver.find_element(By.XPATH, '//button[.//span[contains(text(), "下一關")]]')
                next_stage_button.click()
                match_answer()
                sleep(6500)
            else:
                print('🛑 門票用完，停止')
                break

        sleep(300)

    print('🏁 repeatFlow 全部結束')

repeat_flow(1000)

