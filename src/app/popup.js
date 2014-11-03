// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
  //window.close();
  chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
      chrome.extension.sendMessage({
        type: 'capture',
        tab: tabs[0]
      });
    });
});