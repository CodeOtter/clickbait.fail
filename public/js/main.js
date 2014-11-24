var options = {
    scaleShowGridLines : true,	///Boolean - Whether grid lines are shown across the chart
    scaleGridLineColor : "rgba(44,154,252,.05)",	//String - Colour of the grid lines
    scaleGridLineWidth : 1,	//Number - Width of the grid lines
    bezierCurve : true,	//Boolean - Whether the line is curved between points
    bezierCurveTension : 0.4,	//Number - Tension of the bezier curve between points
    pointDot : true, //Boolean - Whether to show a dot for each point
    pointDotRadius : 4,	//Number - Radius of each point dot in pixels
    pointDotStrokeWidth : 1, //Number - Pixel width of point dot stroke
    pointHitDetectionRadius : 20, //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
    datasetStroke : true, //Boolean - Whether to show a stroke for datasets
    datasetStrokeWidth : 2, //Number - Pixel width of dataset stroke
    datasetFill : true, //Boolean - Whether to fill the dataset with a colour
};

var ctx = document.getElementById("chart").getContext("2d");
var days = ['Sun','Mon','Tues','Wed','Thurs','Fri','Sat'];
var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];

/**
 *
 */
function draw(data) {
	if(!data) {
		data = [];
	}

	var labels = [];
	var reputation = [];
	var mentioners  = {};
	var spikeSupporter = { user: null, icon: null, rating: 0};
	var spikeEnemy = { user: null, icon: null, rating: 0};
	var bestSupporter = { user: null, icon: null, rating: 0};
	var worstEnemy = { user: null, icon: null, rating: 0};
	var total = 0;
	var tweets = 0;
	var totalTime = 0
	var date;

	for(var i in data) {
		var values = i.match(/(.{4})(.{2})(.{2})(.{2})/);
		values.shift();

		var newDate = new Date(values[0], values[1], values[2], values[3]);
		if(date) {
			totalTime += newDate.getTime() - date.getTime();
		}
		date = newDate;
		var day = days[date.getDay()];
		var month = months[date.getMonth()];
		var ampm = 'AM';
		var hour = date.getHours() + 1;
		if(hour > 12)  {
			hour -= 12;
			ampm = 'PM';
		}

		labels.push(hour+ampm+' '+month+' '+day);

		var value = 0;
		for(var j in data[i]) {
			value += data[i][j].rating;

			// Discover spikes
			if(value > spikeSupporter.rating) {
				spikeSupporter = data[i][j];
			}
			if(value < spikeEnemy.rating) {
				spikeEnemy = data[i][j];
			}
			if(!mentioners[data[i][j].user]) {
				mentioners[data[i][j].user] = {
					user: data[i][j].user,
					icon: data[i][j].icon,
					rating: 0
				};
			}
			mentioners[data[i][j].user].rating += data[i][j].rating;
			tweets++;
		}

		reputation.push(value);
		total += value;
	}

	// Discover bests
	for(var i in mentioners) {
		var value = mentioners[i].rating;

		if(value > bestSupporter.rating) {
			bestSupporter = mentioners[i];
		}
		if(value < worstEnemy.rating) {
			worstEnemy = mentioners[i];
		}
	}

	var dataset = {
	    labels: labels,
	    datasets: [
	        {
	            label: "Reputation",
	            fillColor: "rgba(220,220,220,0.2)",
	            strokeColor: "rgba(220,220,220,1)",
	            pointColor: "rgba(220,220,220,1)",
	            pointStrokeColor: "#fff",
	            pointHighlightFill: "#fff",
	            pointHighlightStroke: "rgba(220,220,220,1)",
	            data: reputation
	        }
	    ]
	};

	// Render
	$('#analyze').removeAttr('disabled');
	$('#analyze').val('Analyze');
	if(reputation.length) {
		$('#graph').removeAttr('hidden');

		new Chart(ctx).Line(dataset, options);

		populateMentioners('spikeSupporter', spikeSupporter);
		populateMentioners('spikeEnemy', spikeEnemy);
		populateMentioners('bestSupporter', bestSupporter);
		populateMentioners('worstEnemy', worstEnemy);
		$('#sentiment').html(getNumber(total));
		console.log([tweets, totalTime]);
		$('#mpm').html(getNumber(tweets / (totalTime / 60000)));
	}
};

function getNumber(total) {
	var value = Math.abs(total);

	if(value < 1) {
		return total.toFixed(3);
	} else if(value > 1 && value < 1000) {
		return Math.ceil(total);
	} else if(value > 1000 && value < 1000000) {
		return Math.ceil(total / 1000) + 'K';
	} else if(value > 1000000 && value < 1000000000) {
		return Math.ceil(total / 1000) + 'M';
	} else {
		return Math.ceil(total / 1000) + 'B';
	}
}

/**
 *
 */
function populateMentioners(target, mentioner) {
	var div = $('#' + target);
	if(mentioner.user) {
		div.find('.name').html('<a href="http://www.twitter.com/' + mentioner.user + '" target="_blank">' + mentioner.user + '</a>');
		div.find('.icon').html('<a href="http://www.twitter.com/' + mentioner.user + '" target="_blank"><img src="' + mentioner.icon + '"></a>');
	} else {
		div.find('.name').html('');
		div.find('.icon').html('');
	}
}

/**
 *
 */
function update() {

	var user = $('#user').val();

	if(!user) {
		return;
	}
	$('#analyze').attr('disabled', true);
	$('#analyze').val('Searching...');
	$.ajax({
		type: 'POST',
		url: '/analyze',
		data: { user: user },
		dataType: 'json',
		success: draw,
		error: function() {
			alert('Try again later, something busted :L');
		}
	});
}