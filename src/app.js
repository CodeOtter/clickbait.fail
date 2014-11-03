var http = require('./utils/httpServer'),
    fs = require('fs'),
    behavior = require('./utils/behavior'),
    cache = require('./utils/cache'),
    dropbox = require('./utils/dropbox'),
    scraper = require('./utils/scraper');

var routes = {
  // Server start page
  'GET /': function() {

    return '';
  },
  // Trigger scraping
  'POST /': function() {

    return '';
  },
  // Downloads the browser app
  'GET /app': function() {

    return '';
  },
  // Forwards you to the Dropbox URI to download the data
  'GET /:hash': function(hash) {

    return hash;
  },
  // Gets behavioral data about the source
  'GET /:hash/behavior': function(hash) {

    return hash;
  }
};

// Define routes
http.start(routes, function() {
  // Server is running
});

