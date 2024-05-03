// background.js

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.url) {
      console.log("Current URL:", message.url);
      // Do whatever you want with the URL
    }
  });
  