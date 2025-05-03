(function() {
    const NAME_SELECTOR = '.pgo-style-name-3ijyRY';
    const PRICE_SELECTOR = '.pgo-style-price-9yJqYM';
    const QUANTITY_SELECTOR = '.pgo-style-image-2x9VFm span';
    const ITEM_BTN_SELECTOR = 'button.marketplace_sprite.frame_goods.pgo-style-container-2E3R9C';
    const UPDATE_BTN_SELECTOR = 'button.marketplace_sprite.btn_reload';
    const BUY_BTN_SELECTOR = 'button.cursor_pointer.pgo-style-button-1VMR5A';
    const CONFIRM_BTN_SELECTOR = '.js-confirm-btn';
    const CHECKBOX_SELECTOR = '#confirm-checkbox';
    const PRICE_TARGET_KEY = 'manualLowPriceData';
  
    let resetTimeout = null;
  
    const statusBox = document.createElement('div');
    statusBox.style.position = 'fixed';
    statusBox.style.top = '10px';
    statusBox.style.right = '10px';
    statusBox.style.padding = '8px 12px';
    statusBox.style.background = 'rgba(0,0,0,0.7)';
    statusBox.style.color = '#fff';
    statusBox.style.borderRadius = '8px';
    statusBox.style.zIndex = '9999';
    statusBox.style.fontSize = '14px';
    statusBox.textContent = '⚡ 偵測啟動中...';
    document.body.appendChild(statusBox);
  
    function setStatus(text, color) {
      statusBox.textContent = text;
      statusBox.style.background = color;
    }
  
    function getManualLowPriceData() {
      return JSON.parse(localStorage.getItem(PRICE_TARGET_KEY)) || [];
    }
  
    function checkForCheapDeals() {
      const stored = getManualLowPriceData();
      const nameElements = document.querySelectorAll(NAME_SELECTOR);
      const priceElements = document.querySelectorAll(PRICE_SELECTOR);
      const quantityElements = document.querySelectorAll(QUANTITY_SELECTOR);
      const itemButtons = document.querySelectorAll(ITEM_BTN_SELECTOR);
  
      let foundCheap = false;
  
      for (let i = 0; i < 10; i++) {
        if (!nameElements[i] || !priceElements[i] || !quantityElements[i] || !itemButtons[i]) continue;
  
        const name = nameElements[i].textContent.trim();
        const price = parseFloat(priceElements[i].textContent.replace(/[^0-9]/g, '')) || 0;
        const quantity = parseInt(quantityElements[i].textContent.replace(/[^0-9]/g, '')) || 1;
        const unitPrice = price / quantity;
  
        const matched = stored.find(item => item.name === name);
        if (matched && unitPrice < matched.lowPrice) {
          console.log(`🔥 ${name} 價格符合條件！單價：${unitPrice} < ${matched.lowPrice} → 自動點擊`);
          itemButtons[i].click();
          foundCheap = true;
          setStatus(`🔥 已自動購買：${name}`, 'rgba(255,69,0,0.8)');
  
          setTimeout(() => {
            const checkbox = document.querySelector(CHECKBOX_SELECTOR);
            checkbox?.click();
  
            setTimeout(() => {
              const buyButton = document.querySelector(BUY_BTN_SELECTOR);
              buyButton?.click();
  
              setTimeout(() => {
                const confirmButton = document.querySelector(CONFIRM_BTN_SELECTOR);
                confirmButton?.click();
  
                setTimeout(() => {
                  const updateButton = document.querySelector(UPDATE_BTN_SELECTOR);
                  updateButton?.click();
                }, 500);
  
              }, 100);
            }, 100);
          }, 100);
  
          if (resetTimeout) clearTimeout(resetTimeout);
          resetTimeout = setTimeout(() => {
            setStatus('⚡ 偵測啟動中...', 'rgba(0,0,0,0.7)');
          }, 3000);
  
          break;
        }
      }
  
      if (!foundCheap && !resetTimeout) {
        setStatus('⚡ 偵測啟動中...', 'rgba(0,0,0,0.7)');
      }
    }
  
    setInterval(checkForCheapDeals, 1000);
  })();
  
  // 每 0.5 秒自動按下 reload 按鈕
  setInterval(() => {
    const updateButton = document.querySelector('button.marketplace_sprite.btn_reload');
    updateButton?.click();
  }, 500);