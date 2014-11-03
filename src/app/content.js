function getLinks() {
  var links = document.querySelectorAll("a");
  var results = [];
  var seenLinks = {};
  for (var i  = 0; i < links.length; ++i) {
    if (seenLinks[link])
      continue;

    seenLinks[link] = true;

    results.push({
      href: links[i].href.replace(/(.*)#?/, "$1"),
      text: links[i].textContent + ' (Clickbait)'
    });
  }
  return results;
}

chrome.extension.onMessage.addListener(function(Message, sender, sendResponse) {
  sendResponse(getLinks());
});