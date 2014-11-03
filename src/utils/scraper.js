// wget -k -P $targetdir –exclude-domains ${comma-seperated domain name} -t $retry -w 1 $url
var exec = require('child_process').exec;

module.exports = {

  /**
   *
   */
  scrape: function() {},

  /**
   *
   */
  exists: function() {},

  /**
   *
   */
  upload: function() {},

  /**
   *
   */
  purge: function() {}
};