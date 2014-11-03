var express = require('express'),
    _ = require('lodash');

module.exports = new function(port) {

  /**
   *
   */
  this.start = function(routes, callback) {
    if(this.config) {
      return;
    }

    var self = this;

    this.config = express();

    this.config.use(express.static('public', {
      dotfiles: 'ignore',
      etag: false,
      extensions: ['htm', 'html', 'js', 'css'],
      index: false,
      maxAge: '1d',
      redirect: false,
      setHeaders: function (res, path, stat) {
        res.set('x-timestamp', Date.now())
      }
    }));

    for(i in routes) {
      (function(i) {
        var parts = i.split(' ');

        self.config.route(parts[1])[parts[0].toLowerCase()](function(req, res, next) {
          try {
            var params = _.values(req.params);
            params.push(next);
            params.push(req);
            params.push(res);

            var result = routes[i].apply(self, params);
          } catch(e) {
            res.status(500).send(e.message);
          }

          if(result !== undefined) {
            //console.log(result);
            res.status(200).send(result);
          } else {
            res.status(500).send('Error');
          }
        });
      })(i);
    }

    this.server = this.config.listen(port || 3000, function() {
      var host = self.server.address().address,
          port = self.server.address().port;

      console.log('Web server running at http://%s:%s', host, port);
      callback();
    });
  };
};