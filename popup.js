document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('inject-editor').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.url.includes("www.pagamo.org")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['editor.js']  // 原本的價格編輯器
      });
      window.close();
    } else {
      alert('請先開啟 www.pagamo.org 網頁');
    }
  });

  document.getElementById('inject-autobuy').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.url.includes("www.pagamo.org")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['autobuy.js']  // 新增的自動購買腳本
      });
      window.close();
    } else {
      alert('請先開啟 www.pagamo.org 網頁');
    }
  });
});
