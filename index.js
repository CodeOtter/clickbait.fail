var express = require("express");
var twitter = require("twitter");
var Analyzer = require("./src/analyzer");
var bodyParser = require('body-parser');
var compression = require('compression');
var fs = require('fs');

/**
 * Expecting auth.json to follow this format:
 * {
 *   "consumer_key": "your",
 *   "consumer_secret": "keys",
 *   "access_token_key": "go",
 *   "access_token_secret": "here"
 * }
 */
var tweeter = new twitter(JSON.parse(fs.readFileSync('twitter.json')));
var app = express();

/**
 *
 */
function gather(analyzer, user, callback, next) {
    var options = {
        q: '@' + user + '-filter:retweets',
        lang: 'en',
        count: 100,
        result_type: 'recent',
        include_entities: false
    };

    if(next) {
        options.max_id = next;
    }

    var stream = tweeter.get('/search/tweets.json', options, function (mentions) {
        analyzer.mentions = mentions.statuses;
        var length = analyzer.mentions.length;

        analyzer.analyze(function(timeline) {
            // @TODO: This is shit
            if(Object.keys(timeline).length <= 2) {
                // Only one dimension of data!
                if(length == 100) {
                    gather(analyzer, user, callback, analyzer.mentions[length - 1].id);
                } else {
                    callback(timeline);    
                }
            } else {
                callback(timeline);
            }
        });
    });
}

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());

app.post('/analyze', function (req, res) {
    var user = req.body.user;

    if(user) {
        tweeter.verifyCredentials(function (account) {
            var analyzer = new Analyzer(user);
            gather(analyzer, user, function(timeline) {
                res.send(JSON.stringify(timeline));
            });
        });
    } else {
        res.send('ERROR');
    }
});

var server = app.listen(80, function() {
    var host = server.address().address
    var port = server.address().port

    console.log('Clickbait.fail running on http://%s:%s...', host, port)
});

module.exports = server;