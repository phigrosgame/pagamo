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

    // 抓到畫面選項區
    const optionDivs = document.querySelectorAll('.question-iframe-container.pgo-style-selection-31EiFh');
    const currentOptions = Array.from(optionDivs).map(div =>
        div.querySelector('.pgo-style-selection-content-1x0d36')?.textContent.trim()
    );

    let matchedQuiz = null;

    for (const item of quizData) {
        if (item.question.text === questionText && item.question.img === imgUrl) {
            const matched = item.correctOptions?.some(opt => currentOptions.includes(opt));
            if (matched) {
                matchedQuiz = item;
                break;
            }
        }
    }

    if (!matchedQuiz) {
        console.log('❌ 找不到完全符合的 quizData');
        return;
    }

    console.log('🎯 確認找到 quizData：', matchedQuiz);

    // 尋找正確選項
    optionDivs.forEach(optionDiv => {
        const optionText = optionDiv.querySelector('.pgo-style-selection-content-1x0d36')?.textContent.trim();
        const choiceLetter = optionDiv.querySelector('.pgo-style-selection-choice-zKJKfo')?.textContent.trim();

        if (optionText && matchedQuiz.correctOptions.includes(optionText) && choiceLetter) {
            console.log(`✅ 正確選項是 ${choiceLetter}: ${optionText}`);

            // 傳送給 Python API 點擊
            fetch("http://127.0.0.1:5000/click", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ option: choiceLetter })
            })
                .then(res => res.json())
                .then(data => console.log("📡 Python回應:", data))
                .catch(err => console.error("❌ 發送錯誤:", err));
        }
    });
}
matchAnswer()
