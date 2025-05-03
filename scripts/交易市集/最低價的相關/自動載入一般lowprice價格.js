(function() {
  const LOAD_MORE_BTN_SELECTOR = '.common_ui_borderless_btn_sprite.btn_blue_long.pgo-style-button-1MSehN';
  const NAME_SELECTOR = '.pgo-style-name-3ijyRY'; 
  const PRICE_SELECTOR = '.pgo-style-price-9yJqYM'; 
  const QUANTITY_SELECTOR = '.pgo-style-image-2x9VFm span'; 
  const STORAGE_KEY = 'lowestPriceData';

  let isWaiting = false;

  async function fetchAndStoreData() {
    if (isWaiting) return;

    const nameElements = document.querySelectorAll(NAME_SELECTOR);
    const priceElements = document.querySelectorAll(PRICE_SELECTOR);
    const quantityElements = document.querySelectorAll(QUANTITY_SELECTOR);

    // 確保商品數量有10個以上
    if (nameElements.length < 10 || priceElements.length < 10 || quantityElements.length < 10) {
      console.log('⏳ 商品數量不足10個，等待3秒...');
      isWaiting = true;
      setTimeout(() => {
        isWaiting = false;
      }, 3000);
      return;
    }

    const products = [];

    // 從第10個商品開始抓取並計算單價
    for (let i = 9; i < nameElements.length; i++) {
      const name = nameElements[i]?.textContent.trim();
      const price = parseFloat(priceElements[i]?.textContent.replace(/[^0-9]/g, '')) || 0;
      const quantity = parseInt(quantityElements[i]?.textContent.replace(/[^0-9]/g, '')) || 1;

      if (!name || price === 0 || quantity === 0) continue;

      const lowPrice = price / quantity;
      products.push({ name, lowPrice });
    }

    let stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // 儲存最便宜的商品
    products.forEach(newItem => {
      const exist = stored.find(item => item.name === newItem.name);
      if (!exist) {
        stored.push(newItem);
      } else if (newItem.lowPrice < exist.lowPrice) {
        exist.lowPrice = newItem.lowPrice;
      }
    });

    // 更新 localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    // 顯示更新後的商品數量
    console.log('💾 localStorage更新完成！共', stored.length, '筆商品資料');
    console.log('🔽 以下為儲存的商品：', stored);

    // 👉 抓取後，等待1秒後點擊「載入更多」
    isWaiting = true;
    setTimeout(() => {
      const loadMoreBtn = document.querySelector(LOAD_MORE_BTN_SELECTOR);
      if (loadMoreBtn) {
        loadMoreBtn.click();
        console.log('🆙 點擊載入更多');
      } else {
        console.log('❌ 找不到載入更多按鈕');
      }
      isWaiting = false;
    }, 1000);
  }

  setInterval(fetchAndStoreData, 500);
})();



