var assert = require('assert'),
	Analyzer = require('../src/analyzer');

describe('Analyzer', function() {
	it('should correctly calculate positive sentiment', function(next) {
		var testData = [
			{
			  "created_at": "Sun Nov 23 20:10:30 +0000 2014",
			  "text": "@test is such a nice person",		// score of 3, with comparative of 0.5
			  "in_reply_to_screen_name": "test",
			  "user": {
			    "screen_name": "Tester",
			    "followers_count": 100,
			    "friends_count": 50,
			    "profile_image_url": "someUrl",
			  },
			  "retweet_count": 0,
			  "favorite_count": 0,
			},
			{
			  "created_at": "Sun Nov 23 21:10:30 +0000 2014",
			  "text": "@test is such a good person",		// score of 3, with comparative of 0.5
			  "in_reply_to_screen_name": null,
			  "user": {
			    "screen_name": "Tester2",
			    "followers_count": 10,
			    "friends_count": 5,
			    "profile_image_url": "someUrl",
			  },
			  "retweet_count": 20,
			  "favorite_count": 10,
			},
			{
			  "created_at": "Sun Nov 23 22:10:30 +0000 2014",
			  "text": "@test is such a great person",		// score of 3, with comparative of 0.5
			  "in_reply_to_screen_name": "test",
			  "user": {
			    "screen_name": "Tester3",
			    "followers_count": 1,
			    "friends_count": 0,
			    "profile_image_url": "someUrl",
			  },
			  "retweet_count": 1,
			  "favorite_count": 1,
			}
		];

		var analyzer = new Analyzer('test', [], testData);
		analyzer.analyze(function(timeline) {
			assert.ok(timeline['2014102312'][0].rating === 495.00000000000006);
			assert.ok(timeline['2014102313'][0].rating === 135);
			assert.ok(timeline['2014102314'][0].rating === 9.9);
			next();
		});
	});

	it('should correctly calculate negative sentiment', function(next) {
		var testData = [
			{
			  "created_at": "Sun Nov 23 20:10:30 +0000 2014",
			  "text": "@test is such a bad person",			// score of -3, with comparative of -0.5
			  "in_reply_to_screen_name": "test",
			  "user": {
			    "screen_name": "Tester",
			    "followers_count": 100,
			    "friends_count": 50,
			    "profile_image_url": "someUrl",
			  },
			  "retweet_count": 0,
			  "favorite_count": 0,
			},
			{
			  "created_at": "Sun Nov 23 21:10:30 +0000 2014",
			  "text": "@test is such a terrible person",	// score of -3, with comparative of -0.5
			  "in_reply_to_screen_name": null,
			  "user": {
			    "screen_name": "Tester2",
			    "followers_count": 10,
			    "friends_count": 5,
			    "profile_image_url": "someUrl",
			  },
			  "retweet_count": 20,
			  "favorite_count": 10,
			},
			{
			  "created_at": "Sun Nov 23 22:10:30 +0000 2014",
			  "text": "@test is such a evil person",
			  "in_reply_to_screen_name": "test",			// score of -3, with comparative of -0.5
			  "user": {
			    "screen_name": "Tester3",
			    "followers_count": 1,
			    "friends_count": 0,
			    "profile_image_url": "someUrl",
			  },
			  "retweet_count": 1,
			  "favorite_count": 1,
			}
		];

		var analyzer = new Analyzer('test', [], testData);
		analyzer.analyze(function(timeline) {
			assert.ok(timeline['2014102312'][0].rating === -495.00000000000006);
			assert.ok(timeline['2014102313'][0].rating === -135);
			assert.ok(timeline['2014102314'][0].rating === -9.9);
			next();
		});
	});

	it('should correctly calculate mixed sentiment', function(next) {
		var testData = [
			{
			  "created_at": "Sun Nov 23 20:10:30 +0000 2014",
			  "text": "@test is such a nice person",		// score of 3, with comparative of 0.5
			  "in_reply_to_screen_name": "test",
			  "user": {
			    "screen_name": "Tester",
			    "followers_count": 100,
			    "friends_count": 50,
			    "profile_image_url": "someUrl",
			  },
			  "retweet_count": 0,
			  "favorite_count": 0,
			},
			{
			  "created_at": "Sun Nov 23 21:10:30 +0000 2014",
			  "text": "@test is such a bad person",			// score of -3, with comparative of -0.5
			  "in_reply_to_screen_name": null,
			  "user": {
			    "screen_name": "Tester2",
			    "followers_count": 10,
			    "friends_count": 5,
			    "profile_image_url": "someUrl",
			  },
			  "retweet_count": 20,
			  "favorite_count": 10,
			},
			{
			  "created_at": "Sun Nov 23 22:10:30 +0000 2014",
			  "text": "@test is such a person",			// score of 0, with comparative of 0
			  "in_reply_to_screen_name": "test",
			  "user": {
			    "screen_name": "Tester3",
			    "followers_count": 1,
			    "friends_count": 0,
			    "profile_image_url": "someUrl",
			  },
			  "retweet_count": 1,
			  "favorite_count": 1,
			}
		];

		var analyzer = new Analyzer('test', [], testData);
		analyzer.analyze(function(timeline) {
			assert.ok(timeline['2014102312'][0].rating === 495.00000000000006);
			assert.ok(timeline['2014102313'][0].rating === -135);
			assert.ok(timeline['2014102314'][0].rating === 0);
			next();
		});
	});
});