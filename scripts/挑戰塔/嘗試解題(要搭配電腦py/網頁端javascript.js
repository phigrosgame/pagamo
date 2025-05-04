//js從再試一次頁面開始
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 
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
                    setTimeout(triggerNext, 120); // 答對後下一題
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
        }, 120);

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
        setTimeout(matchAnswer, 120);
    })
    .catch(err => {
        console.error("❌ 發送下一題錯誤:", err);
        setTimeout(matchAnswer, 120);
    });
}







async function grab20Questions() {
    console.log('🔵 開始一輪流程...');
    // 點「詳解」
    const explanationButton = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.trim() === '詳解'
    );
    if (explanationButton) {
        explanationButton.click();
        console.log('✅ 點了「詳解」');
        await sleep(300);
    }

    // 抓取20題
    console.log('📚 開始抓20題');
    await grabQuestion();
    await sleep(300);

    for (let i = 2; i <= 20; i++) {
        const nextButton = Array.from(document.querySelectorAll('div.cursor_pointer.exam_control_list_sprite.q_btn div')).find(div =>
            div.textContent.trim() == String(i)
        );

        if (nextButton) {
            nextButton.click();
            console.log(`➡️ 點到第 ${i} 題`);
            await sleep(10); // 等一下載入

            await grabQuestion();
            await sleep(10);
        } else {
            console.log(`⚠️ 找不到第 ${i} 題按鈕`);
        }
    }

    // 最後退出詳解
    const exitButton = document.querySelector('div.explanation_panel2_sprite.btn_exit');
    if (exitButton) {
        exitButton.click();
        console.log('✅ 退出詳解！');
    }

    console.log('🏁 一輪流程完成！');
}
async function grabQuestion() {
    const div = document.querySelector('.question-iframe-container.pgo-style-question-content-wrapper-DprzUI');
    let questionText = '';
    let imgUrl = '';

    if (div) {
        questionText = div.innerHTML.replace(/<br>/g, '\n').replace(/<\/?[^>]+(>|$)/g, "").trim();
        const img = div.querySelector('img');
        if (img) {
            imgUrl = img.src;
        }
    }

    const correctOptions = [];
    const correctDivs = document.querySelectorAll('div[data-correct="true"]');
    correctDivs.forEach(option => {
        const optionText = option.querySelector('.pgo-style-selection-content-1x0d36')?.textContent.trim();
        if (optionText) {
            correctOptions.push(optionText);
        }
    });

    if (!questionText && correctOptions.length === 0) {
        console.log('⚠️ 沒有找到題目或答案');
        return;
    }

    const newResult = {
        question: {
            text: questionText,
            img: imgUrl || null
        },
        correctOptions: correctOptions.length > 0 ? correctOptions : null
    };

    let existingData = JSON.parse(localStorage.getItem('quizData'));
    if (!Array.isArray(existingData)) {
        existingData = [];
    }

    const isDuplicate = existingData.some(item =>
        item.question.text === newResult.question.text &&
        JSON.stringify(item.correctOptions) === JSON.stringify(newResult.correctOptions)
    );

    if (!isDuplicate) {
        existingData.push(newResult);
        localStorage.setItem('quizData', JSON.stringify(existingData));
        console.log('✅ 新資料已存入 localStorage');
    } else {
        console.log('🔁 重複的資料，不存');
    }
}



async function repeatFlow(times = 100) {
    for (let i = 1; i <= times; i++) {
        console.log(`🎯 第 ${i} 次流程開始`);
        // 點「再試一次」
        const retryButton =  Array.from(document.querySelectorAll('button')).find(btn =>
            btn.textContent.trim() === '再試一次'
        ); 
        // 檢查分數
        const scoreSpan = document.querySelector('span.pgo-style-number-_ff4Au');
        const score = scoreSpan ? parseInt(scoreSpan.textContent.trim()) : 0;

        console.log(`📊 當前得分: ${score}`);

        if (score < 18) {
            console.log('❌ 分數不滿 18，進行 autoFlow()');
            await grab20Questions();
            await retryButton.click();
            await sleep(300); // 等待點擊後的加載

            matchAnswer(); // 點擊後進行答題
            await sleep(6500);  // 等待 15 秒（15000 毫秒）
            await console.log('5');// 進行 autoFlow() 後，繼續答題
            
        } else {
            console.log('✅ 分數達標，檢查門票是否大於 0');

            const ticketDiv = document.querySelector('div.pgo-style-tickets-count-6OaTMF');
            const ticketCount = ticketDiv ? parseInt(ticketDiv.textContent.trim()) : 0;

            if (ticketCount > 0) {
                console.log(`🎫 有 ${ticketCount} 張門票，點擊『下一關』`);

                const nextStageButton = Array.from(document.querySelectorAll('button'))
                    .find(btn => btn.textContent.trim() === '下一關');
                if (nextStageButton) {
                    nextStageButton.click();
                    matchAnswer_loop='true';
                    await matchAnswer();
                    await sleep(6500);  // 等待 15 秒（15000 毫秒）
 // 點擊後進行答題
                } else {
                    console.log('⚠️ 找不到「下一關」按鈕');
                }
            } else {
                console.log('🛑 門票用完，停止');
                break;
            }
        }

        await sleep(300); // 每輪間隔
    }

    console.log('🏁 repeatFlow 全部結束');
}
let matchAnswer_loop='true';
await repeatFlow(1000); // 開始流程
