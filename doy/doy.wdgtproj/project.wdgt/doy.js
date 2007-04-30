// Main UI for the widget.  This is the Apple RSS demo code, gutted where
// needed for the DoY widget (which is why there's lots of stuff in here
// that doesn't need to be).

// How often to check for updates to the DoY web site (in milliseconds)
// Default is once a day:
var refreshMs = 1000 * 60 * 60 * 24 ;

// For date formatting by formatDate():
var monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];


// List of Cinema objects ordered alpha by city
var cinemas ;

var initKeyPrefix = "apple-init-";

// The user's cinema name:
var myCinema = "Duke Of Yorks";
var myCinemaChanged = false;

var htmlFeedURL = null;
var feedURLKey = "feedURL";

var feed = { url: null, title: "" };
var newFeedURL = null;


var last_updated = 0;
var xml_request = null;


function load()
{    
	cinemas = [
		new Cinema("Bath", "The Little Theatre Cinema", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=bath"),
		new Cinema("Brighton", "Duke Of Yorks", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=doyb"),
		new Cinema("Cambridge", "Arts Picturehouse", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=camb")
	];

	if (window.widget) {
		htmlFeedURL = getFeedSource();		
		feed.url = htmlFeedURL;
		setFeedURL(feed.url);

			
	}
}

function remove()
{
	// your widget has just been removed from the layer
	// remove any preferences as needed
}

function hide()
{
	// your widget has just been hidden stop any timers to
	// prevent cpu usage
}

function show()
{

	// your widget has just been shown.  restart any timers
	// and adjust your interface as needed
	fetchListings();
}

function fetchListings()
{

var now = new Date().getTime();
	
	// Only fetch the feed once a day (or whatever refreshMs is).
	if ((now - last_updated) > refreshMs) 
	{
	
		htmlFeedURL = getFeedSource();		
		feed.url = htmlFeedURL;
		setFeedURL(feed.url);

	
		if (xml_request != null) {
			xml_request.abort();
			xml_request = null;
			alert("not null");
		}

		// Remove the old entries
		var contents = document.getElementById('content');
		removeEntriesFromContents(contents);

		xml_request = new XMLHttpRequest();

		xml_request.onload = function(e) {xml_loaded(e, xml_request);} ;
		xml_request.open("GET", feed.url);
		xml_request.setRequestHeader("Cache-Control", "no-cache");
		xml_request.send(null);
    }

}


function showBack(event)
{
	// your widget needs to show the back
	var select = document.getElementById("popup");
	
		for (i = 0; i<cinemas.length ; i++)
		{
		
			select.options[i].value = cinemas[i].city;
			select.options[i].text = cinemas[i].city;
			if (myCinema == cinemas[i].name)
			{
				select.options[i].selected = true;
			}
	 }



	var front = document.getElementById("front");
	var back = document.getElementById("back");

	if (window.widget)
	{
		widget.prepareForTransition("ToBack");
    }

	front.style.display="none";
	back.style.display="block";
	
	if (window.widget)
	{
		setTimeout('widget.performTransition();', 0);
	}
}

function showFront(event)
{
	// your widget needs to show the front

	if (myCinemaChanged)
	{
	    fetchListings();
		myCinemaChanged = false;
	}
	var front = document.getElementById("front");
	var back = document.getElementById("back");

	if (window.widget)
	{
		widget.prepareForTransition("ToFront");
	}

	front.style.display="block";
	back.style.display="none";
	
	if (window.widget)
	{
		setTimeout('widget.performTransition();', 0);
	}

	scrollArea.refresh();
}

if (window.widget) {
	widget.onremove = remove;
	widget.onhide = hide;
	widget.onshow = show;
}

// Retrieve the contents of an HTML div
function getPropertyFromHTML(propertyKey, defaultValue)
{
	var element = document.getElementById(initKeyPrefix + propertyKey);
	if (element) {
		return trim(element.innerHTML);
	}
	else {
		return defaultValue;
	}
}

function getFeedSource()
{
//	var url = getPropertyFromHTML(feedURLKey);

//	if (url) {
//		if (url.substring(0,7).toLowerCase() != "http://") {
//			url = "http://" + url;
//		}
//	}
//	return url;

	for (i = 0; i<cinemas.length ; i++)
	{
		if (myCinema == cinemas[i].name)
		{
			return cinemas[i].url;
		}
	 }

	return null;



}

function findChild(element, nodeName)
{
	var child;
	
	for (child = element.firstChild; child != null; child = child.nextSibling) {
		if (child.nodeName == nodeName)
		{
			return child;
		}
	}
	
	return null;
}

function xml_loaded (e, request) 
{
	xml_request = null;
	if (request.responseText) {		
	
		var contents = document.getElementById('content');

		// Remove the old entries
		removeEntriesFromContents(contents);
		
		// Get the top level element
		var html = request.responseText;

	    var parser = new ListingsParser();
		var results = parser.findMovies(html, getFeedSource());

		// Remove listings that have passed
		var now = new Date();
		for(var title in results)
		{
			var movie = results[title];
			movie.trimTo(now);
		}

		
		
		// Generate the display
		var n = addEntriesToContents(contents, results);

		// Got no results?
		if (n == 0)
		{
			var msg = document.createElement('div');
			msg.innerText = "no listings found.";
			contents.appendChild(msg);
			return;
		}


		// update the scrollbar so scrollbar matches new data
		scrollArea.refresh();
		
		// set last_updated to the current time to keep track of the last time a request was posted
		last_updated = new Date().getTime();
	}
}

function removeEntriesFromContents(contents)
{
	while (contents.hasChildNodes()) {
		contents.removeChild(contents.firstChild);
	}
}

function addEntriesToContents(contents, entries)
{
	var count = 0;
	var even = true;		
				
	for(var title in entries)
	{
	    var movie = entries[title];
		even = !even;
		contents.appendChild ( createRow(entries[title],even) );
		count++;
	}
	
	return count;
	
}


function createRow (movie, even)
{
	var article = document.createElement('div');
	article.setAttribute('class', 'article ' + (even ? "even" : "odd"));
	
	var articlefooter = document.createElement('div');
	articlefooter.setAttribute('class', 'articlefooter');
	article.appendChild(articlefooter);

	var articlehead = document.createElement('a');
	articlehead.setAttribute('class', 'articlehead');
	articlehead.href = movie.info_url;
	articlehead.onclick = function() { widget.openURL(this.href); return false; };

	//if (link != null) {
	//	articlehead.setAttribute('the_link', link);
//		articlehead.setAttribute('onclick', 'clickOnTitle(event, this);');
	//	articlehead.setAttribute('href', '#');
//	}
	
	var subject_div = document.createElement('div');
	subject_div.setAttribute('class', 'subject');
	subject_div.innerText = movie.movie_title;
	articlehead.appendChild(subject_div);
	
	
	//	var date_div = document.createElement('div');
	//	date_div.setAttribute ('class', 'date');
		
	//		date_div.innerText = listing.showing_date + "@" + listing.showing_time;
		
		
	//	articlehead.appendChild(date_div);
	
	article.appendChild(articlehead);
	
	
	
		var desc_div = document.createElement('div');
		desc_div.setAttribute('class', 'articlebody');
		
		var info = "";
	    var dates = movie.orderedDates();
	    for(i = 0; i<dates.length; i++)
		{
			var d = dates[i];
			var times = movie.showing_dates[d.toString()];
			info = info + formatDate(d) +" @ "+times+"<br/>";
			
		}
			desc_div.innerHTML = info;
	

		article.appendChild(desc_div);
		return article;
}

function formatDate(d)
{

return dayName[d.getDay()] + " " + d.getDate() + " " + monthName[d.getMonth()];

}


// Correct hyperlinks in a document fragment to use the openURL function
function fixLinks(htmlFragment)
{
	// Collect all the links
	var links = htmlFragment.getElementsByTagName("a");
	for (var i = 0; i < links.length; i++) {
		var aNode = links[i];
		// Send them to our clickOnLink function
		aNode.onclick = clickOnLink;
	}
}

// XXX - http://delete.me.uk/2005/03/iso8601.html
// XXX - license unclear, discuss or replace
Date.prototype.setISO8601 = function (string) {
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
        "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
        "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = string.match(new RegExp(regexp));

    var offset = 0;
    var date = new Date(d[1], 0, 1);

    if (d[3]) { date.setMonth(d[3] - 1); }
    if (d[5]) { date.setDate(d[5]); }
    if (d[7]) { date.setHours(d[7]); }
    if (d[8]) { date.setMinutes(d[8]); }
    if (d[10]) { date.setSeconds(d[10]); }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    time = (Number(date) + (offset * 60 * 1000));
    this.setTime(Number(time));
}


function compTop10Func(a, b)
{
	var aInt = parseInt(a.title);
	var bInt = parseInt(b.title);
	if (aInt < bInt)
		return -1;
	else if (aInt > bInt)
		return 1;
	else
		return 0;
}

function compTitleFunc(a, b)
{
	if (a.title < b.title)
		return -1;
	else if (a.title > b.title)
		return 1;
	else
		return 0;
}

function compFunc(a, b)
{
	if (a.date < b.date)
		return 1;
	else if (a.date > b.date)
		return -1;
	else
		return 0;
}

function createDateStr (date)
{
	var month;
	switch (date.getMonth()) {
		case 0: month = 'Jan'; break;
		case 1: month = 'Feb'; break;
		case 2: month = 'Mar'; break;
		case 3: month = 'Apr'; break;
		case 4: month = 'May'; break;
		case 5: month = 'Jun'; break;
		case 6: month = 'Jul'; break;
		case 7: month = 'Aug'; break;
		case 8: month = 'Sep'; break;
		case 9: month = 'Oct'; break;
		case 10: month = 'Nov'; break;
		case 11: month = 'Dec'; break;
	}	
	return month + ' ' + date.getDate();
}

// Open in the browser instead of in the widget
function clickOnLink()
{
	if (window.widget) {
		widget.openURL(this.href);
		return false;
	}
}

function clickOnTitle(event, div)
{
	if (window.widget) {
		widget.openURL(div.the_link);
	}
}

function clickOnFeedTitle(event)
{
	if (window.widget) {
		widget.openURL(feed.url);
	}
}

function setFeedURL(newURL)
{
	newFeedURL = newURL;
}

function scaleArticles( value )
{
    var content = document.getElementById('content');
    content.style.appleLineClamp = value + "%";
}

function endScale()
{
	//scrollArea.refresh();
}




/*
Called when the user selects a cinema.  We could defer this until
they hit the done button. 
*/
function cinemaSelected() 
{
	var select = document.getElementById("popup");

    myCinema = cinemas[select.selectedIndex].name;
	
	document.getElementById("text").innerHTML = myCinema;

	
	last_updated = 0;
	myCinemaChanged = true;
}