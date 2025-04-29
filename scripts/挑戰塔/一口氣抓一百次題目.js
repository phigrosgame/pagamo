async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function autoFlow() {
    console.log('🔵 開始一輪流程...');

    // 點「再試一次」
    const retryButton = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.trim() === '再試一次'
    );
    if (retryButton) {
        retryButton.click();
        console.log('✅ 點了「再試一次」');
        await sleep(300);
    }

    // 點「直接送出」(div)
    const submitDiv = document.querySelector('div.attack_modal_exam_sprite.btn_exam_submit');
    if (submitDiv) {
        submitDiv.click();
        console.log('✅ 點了「直接送出」(div)');
        await sleep(300);
    }

    // 點「直接送出」(綠色 button)
    const confirmSubmitButton = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.trim() === '直接送出'
    );
    if (confirmSubmitButton) {
        confirmSubmitButton.click();
        console.log('✅ 點了「直接送出」(綠色 button)');
        await sleep(300);
    }

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
    await grab20Questions();

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

async function grab20Questions() {
    await grabQuestion();
    await sleep(300);

    for (let i = 2; i <= 20; i++) {
        const nextButton = Array.from(document.querySelectorAll('div.cursor_pointer.exam_control_list_sprite.q_btn div')).find(div =>
            div.textContent.trim() == String(i)
        );

        if (nextButton) {
            nextButton.click();
            console.log(`➡️ 點到第 ${i} 題`);
            await sleep(300); // 等一下載入

            await grabQuestion();
            await sleep(300);
        } else {
            console.log(`⚠️ 找不到第 ${i} 題按鈕`);
        }
    }
}

// 🔥 新增重複100次主控
async function repeatFlow(times = 100) {
    for (let i = 1; i <= times; i++) {
        console.log(`🎯 第 ${i} 次流程開始`);
        await autoFlow();
        await sleep(300); // 每輪間隔 0.3秒，避免過快
    }
    console.log('🏆 100輪全部結束！');
}

// 執行
repeatFlow(100);
