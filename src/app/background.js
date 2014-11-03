// Considerable help from https://github.com/marcinwieprzkowicz/take-screenshot

// Click bait in the last seven days
var clickbait = {},
    DEV = true;

function debug(message) {
  if(DEV) {
    console.log(message);
  }
}

/**
 *
 */
function contentAction(name, data, callback) {
  if(data instanceof Function) {
    callback = data;
    data = {};
  }
  data.type = name;
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, data, callback);
  });
}

/**
 * Application actions
 */
var actions = {

  /**
   *
   */
  requestCapture: function() {
    debug('Capturing started...');
    chrome.extension.sendMessage({
      type: "capture"
    });
  },

  /**
   *
   */
  requestRefresh: function() {
    debug('Refreshing started...');
    chrome.extension.sendMessage({
      type: "refresh"
    });
  },

  /**
   *
   */
  assembleImage: function(details, canvas, context, callback) {
    debug('Assembling image...');
    setTimeout(function () {
      // Capture the visible tab data
      chrome.tabs.captureVisibleTab(null, {
        format: "png"
      }, function (dataURI) {

        var image = new Image();

        if (typeof dataURI !== "undefined") {
          // We have image data to stitch, so load the image

          image.onload = function() {

            // Render image to the canvas
            context.drawImage(image, 0, details.position);

            if (details.lastCapture) {
              // The scrolling is finished
              actions.resetPage(function() {
                callback({
                  image: canvas.toDataURL("image/png").split(',')[1],
                  width: details.size.width,
                  height: details.size.height
                });
              });
            } else {
              // Continue to scroll and continue to capture
              details.scrollTo = details.position + details.scrollBy;
              actions.scrollPage(details, function(captureData) {
                details.position = captureData.position;
                details.lastCapture = captureData.lastCapture;
                actions.assembleImage(details, canvas, context, callback);
              });
            }
          };

          image.src = dataURI;
        }
      });
    }, 300);
  },

  /**
   *
   */
  imageCapture: function(tab, callback) {
    debug('Capturing image...');

    // Build the canvas
    var canvas = document.createElement("canvas"),
        context = canvas.getContext("2d"),
        size, scrollBy, originalParams;

    actions.getPageDetails(function(details) {
      // resize the canvas
      canvas.width = details.size.width;
      canvas.height = details.size.height;
      details.scrollTo = 0;

      // Begin scroll and capture
      debug('Scrolling...');
      actions.scrollPage(details, function(captureData) {
        details.position = captureData.position;
        details.lastCapture = captureData.lastCapture;
        actions.assembleImage(details, canvas, context, callback);
      });
    });
  },

  /**
   *
   */
  uploadCapture: function(data, callback) {
    debug('Uploading image...');

    if(DEV) {
      callback({
        url: 'test',
        remove: 'test'
      });
      return;
    }

    var fd = new FormData();
    fd.append("image", data);
    fd.append("type", 'base64');

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.imgur.com/3/image");
    xhr.setRequestHeader("Authorization", "Client-ID 1092d483cc02d56");
    /*
    data: Object
      account_url: null
      animated: false
      bandwidth: 0
      datetime: 1414982327
      deletehash: "<hash>"
      description: null
      favorite: false
      height: 622
      id: "id"
      link: "http://i.imgur.com/<id>.png"
      name: ""
      nsfw: null
      section: null
      size: 98276
      title: null
      type: "image/png"
      views: 0
      vote: null
      width: 1072
    status: 200
    success: true
    */
    xhr.onload = function() {
      var response = JSON.parse(xhr.responseText);
      callback({
        url: response.data.link,
        remove: response.data.deletehash
      });
    };
    xhr.send(fd);
  },

  /**
   *
   */
  replaceLinks: function(tab) {
    debug('Replacing links...');
  },

  /**
   *
   */
  updateClickbait: function(callback) {
    debug('Updating clickbait...');
    callback({});
  },

  /**
   *
   */
  addClickbait: function(data, callback) {
    debug('Adding clickbait...');
    
    // Gather all text from the tab

    var fd = new FormData();
    fd.append("text", data.text);
    fd.append("url", data.url);
    fd.append("remove", data.remove);
    fd.append("width", data.width);
    fd.append("height", data.height);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://www.clickbait.fail");

    xhr.onload = function() {
      debug('Clickbait added');
      callback(JSON.parse(xhr.responseText));
    };
    xhr.send(fd);
  },

  // Content Actions

  /**
   *
   */
  getPageDetails: function(callback) {
    debug('Getting page details...');
    contentAction('getPageDetails', callback);
  },

  /**
   *
   */
  scrollPage: function(data, callback) {
    debug('Scrolling page...');
    contentAction('scrollPage', data, callback);
  },

  /**
   *
   */
  resetPage: function(callback) {
    debug('Resetting page...');
    contentAction('resetPage', callback);
  },

  /**
   *
   */
  gatherText: function(callback) {
    debug('Gathering text...');
    contentAction('gatherText', callback);
  }
};

/**
 * Application message routes
 */
var routes = {

  /**
   *
   */
  capture: function(message, sender, callback) {
    actions.imageCapture(message.tab, function(imageData) {
      actions.uploadCapture(imageData.image, function(cdn) {
        actions.gatherText(function(text) {
          actions.addClickbait({
            text: text,
            url: cdn.url,
            remove: cdn.remove,
            width: imageData.width,
            height: imageData.height
          }, function() {
            debug('Capture complete');
            actions.requestRefresh();
          });
        });
      });  
    });
  },

  /**
   *
   */
  refresh: function(message, sender, callback) {
    chrome.tabs.query({ active: true }, function(tabs) {
      for(var i in tabs) {
        actions.replaceLinks(tabs[i]);
      }
    });
  }
};

/**
 * Applciation Listeners
 */

// Background message router
chrome.extension.onMessage.addListener(function(message, sender, callback) {
  if(routes[message.type]) {
    routes[message.type].apply(this, arguments);
  }
});

// On tab URL change, replace all links
chrome.tabs.onUpdated.addListener(function(tabId, diff, tab) {
  if(diff.status == 'complete') {
    actions.replaceLinks(tab);
  }
});

// On extension load
actions.updateClickbait(function() {
  debug('Background loaded');
  actions.requestRefresh();
});