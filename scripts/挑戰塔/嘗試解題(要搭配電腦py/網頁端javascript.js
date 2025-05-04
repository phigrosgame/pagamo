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
                    setTimeout(triggerNext, 300); // 答對後下一題
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
    // 檢查是否有送出按鈕，若有且文字是 "送出"
    const submitButton = document.querySelector('#answer-panel-submit-button');
    const real_submit=document.querySelector(".attack_modal_exam_sprite.btn_exam_submit.cursor_pointer.pgo-style-exam-submit-1TqFkL")
    if (submitButton && submitButton.textContent.trim() === '送出') {
        console.log('✅ 找到「送出」按鈕');

        // 點擊「送出」
        real_submit.click()
        console.log('✅ 點擊了「送出」或「下一題」按鈕');

        // 等待一下再點「直接送出」
        setTimeout(() => {
            const confirmSubmitButton = document.querySelector('button[data-version="default"][data-size="small"][data-color="green"]');
            if (confirmSubmitButton) {
                confirmSubmitButton.click();
                console.log('✅ 點擊了「直接送出」按鈕');
            } else {
                console.log('❌ 找不到「直接送出」按鈕');
            }
        }, 100);

        return; // ⛔️ 點完「直接送出」就停止，不再繼續下面的流程
    }

    // 如果沒進入上面條件，才執行下一題流程
    fetch("http://127.0.0.1:5000/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option: "next" })
    })
    .then(res => res.json())
    .then(data => {
        console.log("➡️ 已送出下一題:", data);
        setTimeout(matchAnswer, 300);
    })
    .catch(err => {
        console.error("❌ 發送下一題錯誤:", err);
        setTimeout(matchAnswer, 300);
    });
}


// 啟動自動答題
matchAnswer();
