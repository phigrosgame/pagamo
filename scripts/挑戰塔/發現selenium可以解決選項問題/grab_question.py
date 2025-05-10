from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import json
options = Options()
options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")

# 連接到已經啟動的 Chrome 實例
driver = webdriver.Chrome(options=options)


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

    quiz_data_raw = driver.execute_script("return localStorage.getItem('quizData')")
    if quiz_data_raw:
        existing_data = json.loads(quiz_data_raw)
    else:
        existing_data = []
    if not isinstance(existing_data, list):
        existing_data = []

    is_duplicate = any(item['question']['text'] == new_result['question']['text'] and json.dumps(item['correctOptions']) == json.dumps(new_result['correctOptions']) for item in existing_data)

    if not is_duplicate:
        existing_data.append(new_result)
        driver.execute_script(f"localStorage.setItem('quizData', '{json.dumps(existing_data)}')")
        print('✅ 新資料已存入 localStorage')
    else:
        print('🔁 重複的資料，不存')
grab_question()
