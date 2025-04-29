function matchAnswer() {
    const div = document.querySelector('.question-iframe-container.pgo-style-question-content-wrapper-DprzUI');
    if (!div) {
        console.log('❌ 找不到題目區域');
        return;
    }

    // 取得題目文字和圖片網址
    let questionText = div.innerHTML.replace(/<br>/g, '\n').replace(/<\/?[^>]+(>|$)/g, "").trim();
    const img = div.querySelector('img');
    const imgUrl = img ? img.src : null;

    console.log('📝 當前題目:', questionText);
    console.log('🖼️ 當前圖片:', imgUrl);

    // 讀取 localStorage 的 quizData
    let quizData = JSON.parse(localStorage.getItem('quizData')) || [];

    // 找到符合的題目
    const matchedQuiz = quizData.find(item =>
        item.question.text === questionText &&
        item.question.img === imgUrl
    );

    if (!matchedQuiz) {
        console.log('❌ 找不到符合的題目資料');
        return;
    }

    console.log('🎯 找到符合的 quizData：', matchedQuiz);

    // 找到選項的內容
    const optionDivs = document.querySelectorAll('.question-iframe-container.pgo-style-selection-31EiFh');

    optionDivs.forEach(optionDiv => {
        const optionText = optionDiv.querySelector('.pgo-style-selection-content-1x0d36')?.textContent.trim();
        if (optionText && matchedQuiz.correctOptions && matchedQuiz.correctOptions.includes(optionText)) {
            console.log(`✅ 找到正確答案: ${optionText}`);

            const choiceLetter = optionDiv.querySelector('.pgo-style-selection-choice-zKJKfo')?.textContent.trim(); // A, B, C...
            if (choiceLetter) {
                console.log(`📤 傳送選項給 Python：${choiceLetter}`);

                // 發送 HTTP 請求給本地端 Flask
                fetch('http://127.0.0.1:5000/click', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ option: choiceLetter })
                })
                .then(response => response.json())
                .then(data => console.log('伺服器回應:', data))
                .catch(error => console.error('❌ 發送點擊請求失敗:', error));
            } else {
                console.log('❌ 找不到選項字母');
            }
        }
    });
}

// ✅ 這裡加上呼叫
matchAnswer();

