var sentiment = require("sentiment");

/**
 * Creates a timestamp string to filter timeline events into hours
 */
function generateTimelineKey(datetime) {
	var date = new Date(datetime);

    var year = date.getFullYear();
    var month = date.getMonth(); 
    var day = date.getDate();
    var hour = date.getHours();

    if(month.toString().length == 1) {
        month = '0'+month;
    }
    if(day.toString().length == 1) {
        day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        hour = '0'+hour;
    }

    return year.toString() + month.toString() + day.toString() + hour.toString();
}

/**
 * Sentiment is shared across the audience as a baseline rating, and as that audience interacts, the influence multipler affects the rating multiplicitavely.
 * This is to approximate network spread.  Direct replies increases rating by 10%.
 */
function calculateRating(analyzer, sentiment, mention) {
	var audience = mention.user.followers_count + mention.user.friends_count;
	var interactions = mention.retweet_count + mention.favorite_count;
	var influence = interactions / audience;

	if(mention.in_reply_to_screen_name == analyzer.user) {
		// Direct replies increases sentiment by 10% to account for intention of sentiment
		sentiment *= 1.1;
	}
	return sentiment * audience + (sentiment * audience * influence);
}

/**
 * Appends an event to a timeline
 */
function appendTimeline(analyzer, key, event) {
	if(!analyzer.timeline[key]) {
		analyzer.timeline[key] = [];
	}
	analyzer.timeline[key].push(event);
}

/**
 * Analyzes mentions to generate a timeline of influence and sentiment
 */
function analyzeMentions(analyzer, callback) {
	var mentionsProcessed = 0;

	if(analyzer.mentions.length == 0) {
		callback(analyzer.timeline);
	}

	function iterator(mention) {
		var key = generateTimelineKey(mention.created_at);
		sentiment(mention.text, function (err, value) {
			mentionsProcessed++;
			appendTimeline(analyzer, key, {
				user: mention.user.screen_name,
				icon: mention.user.profile_image_url,
				rating: calculateRating(analyzer, value.score, mention)
			});

			if(mentionsProcessed == analyzer.mentions.length) {
				callback(analyzer.timeline);
			}
		});
	}

	for(var i in analyzer.mentions) {
		iterator(analyzer.mentions[i]);
	}
}

/**
 * @TODO: Allow DIC for sentiment algo and for wordlist
 * @TODO: Add multiple wordlist analysis
 */
var Analyzer = function(user, tweets, mentions) {
	this.user = user;
	this.tweets = tweets || [];
	this.mentions = mentions || []
	this.timeline = {};
};

/**
 * Begins an analysis of sentiment
 */
Analyzer.prototype.analyze = function(callback) {
	analyzeMentions(this, callback);
};

module.exports = Analyzer;