/**
 * Application actions
 */
var actions = {

  /**
   *
   */
  getPageDetails: function(message, send, callback){
    var size = {
      width: Math.max(
        document.documentElement.clientWidth,
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth),
      height: Math.max(
        document.documentElement.clientHeight,
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight)
    };

    callback({
      size: size,
      scrollBy: window.innerHeight,
      originalParams: {
        overflow: document.querySelector("html").style.overflow,
        scrollTop: document.documentElement.scrollTop
      }
    });
  },

  /**
   *
   */
  scrollPage: function(message, send, callback){
    var lastCapture = false;
    window.scrollTo(0, message.scrollTo);
    // first scrolling
    if (message.scrollTo === 0) {
      document.querySelector("html").style.overflow = "hidden";
    }

    // last scrolling
    if (message.size.height <= (window.pageYOffset || document.documentElement.scrollTop) + message.scrollBy) {
      lastCapture = true;
      message.scrollTo = message.size.height - message.scrollBy;
    }
    callback({
      position: message.scrollTo,
      lastCapture: lastCapture
    });
  },

  /**
   *
   */
  resetPage: function(message, send, callback){
    window.scrollTo(0, 0);
    //document.querySelector("html").style.overflow = originalParams.overflow;
    // window.close();
    callback();
  },

  /**
   *
   */
  gatherText: function(message, send, callback) {
    var contents = [document.title],
        badTags = ['script', 'style', 'noscript'];

    var elements = document.body.getElementsByTagName("*");

    for(var i = 0; i < elements.length; i++) {
      var current = elements[i];
      if(current.children.length === 0 && badTags.indexOf(current.tagName.toLowerCase()) === -1) {
        var text;
        if(current.nodeType === 1) {
            text = current.textContent;
        } else if (current.nodeType === 3) {
            text = current.data;
        }

        text = text.replace(/  |\n|\t/g, '').replace(/<[^>]+>/g, '');
        if(text !== '') {
          contents.push(text);
        }
      }
    }
    callback(contents.join("\t"));
  }
};

// Content script message routing
chrome.runtime.onMessage.addListener(function(message, sender, callback) {
  if(actions[message.type]) {
    actions[message.type].apply(this, arguments);
  }
});