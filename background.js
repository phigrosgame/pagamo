chrome.action.onClicked.addListener((tab) => {
    if (tab.url.includes("www.pagamo.org")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
    } else {
      alert("請先打開 www.pagamo.org 再點擊此擴充功能");
    }
  });
  