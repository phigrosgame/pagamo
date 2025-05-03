function matchAnswer() {
    const div = document.querySelector('.question-iframe-container.pgo-style-question-content-wrapper-DprzUI');
    if (!div) {
        console.log('❌ 找不到題目區域');
        triggerNext(); // 即使找不到題目也嘗試下一題
        return;
    }

    let questionText = div.innerHTML.replace(/<br>/g, '\n').replace(/<\/?[^>]+(>|$)/g, "").trim();
    const img = div.querySelector('img');
    const imgUrl = img ? img.src : null;

    console.log('📝 當前題目:', questionText);
    console.log('🖼️ 當前圖片:', imgUrl);

    let quizData = JSON.parse(localStorage.getItem('quizData')) || [];
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
        triggerNext();  // 找不到答案也跳下一題
        return;
    }

    console.log('🎯 確認找到 quizData：', matchedQuiz);

    let clicked = false;

    optionDivs.forEach(optionDiv => {
        const optionText = optionDiv.querySelector('.pgo-style-selection-content-1x0d36')?.textContent.trim();
        const choiceLetter = optionDiv.querySelector('.pgo-style-selection-choice-zKJKfo')?.textContent.trim();

        if (optionText && matchedQuiz.correctOptions.includes(optionText) && choiceLetter && !clicked) {
            clicked = true;

            fetch("http://127.0.0.1:5000/click", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ option: choiceLetter })
            })
                .then(res => res.json())
                .then(data => {
                    console.log("📡 Python回應:", data);
                    setTimeout(triggerNext, 1000); // 答對後下一題
                })
                .catch(err => {
                    console.error("❌ 發送錯誤:", err);
                    triggerNext(); // 發送錯誤也跳
                });
        }
    });

    if (!clicked) {
        console.log("❌ 無法對應正確選項");
        triggerNext(); // 沒點到也跳
    }
}

function triggerNext() {
    fetch("http://127.0.0.1:5000/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option: "next" })
    })
    .then(res => res.json())
    .then(data => {
        console.log("➡️ 已送出下一題:", data);
        setTimeout(matchAnswer, 2000); // 再過2秒做下一輪
    })
    .catch(err => {
        console.error("❌ 發送下一題錯誤:", err);
        setTimeout(matchAnswer, 2000); // 即使失敗也再試
    });
}

// 啟動自動答題
matchAnswer();
