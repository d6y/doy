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
var cinemas;

// The user's cinema name:
var myCinema = "Duke Of Yorks";

// The user's cinema is persisted under this key:
var MY_CINEMA_KEY = "cinema";

// Used to refresh the listings if the user changes their cinema
var myCinemaChanged = false;


var last_updated = 0;
var xml_request = null;


function load()
{    

// This one may be different:
// new Cinema("All London Picturehouses", "All London Picturehouses", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=allLondon"),
 
	cinemas = [
		new Cinema("Aberdeen", "The Belmont Picturehouse", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=bmnt"),
		new Cinema("Bath","The Little Theatre Cinema", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=bath"),
		new Cinema("Brighton", "Duke Of Yorks", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=doyb"),
		new Cinema("Brixton", "Ritzy Picturehouse", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=ritz"),
		new Cinema("Cambridge", "Arts Picturehouse", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=camb"),
		new Cinema("Clapham", "Clapham Picturehouse", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=cph"),
		new Cinema("Edinburgh", "Cameo Picturehouse", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=edbg"),
		new Cinema("Exeter", "Exeter Picturehouse", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=xtr"),
		new Cinema("Greenwich", "Greenwich Picturehouse", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=gnw"),
		new Cinema("Henley-on-Thames", "Regal Picturehouse", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=rgl"),
		new Cinema("Liverpool", "Picturehouse at FACT", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=fact"),
		new Cinema("Notting Hill", "Gate Picturehouse", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=gate"),
		new Cinema("Oxford", "Phoenix Picturehouse", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=oxfd"),
		new Cinema("Southampton", "Harbour Lights", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=hlsh"),
		new Cinema("Stratford", "Stratford East", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=se"),
		new Cinema("Stratford-upon-Avon", "Stratford upon Avon", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=soa"),
		new Cinema("York", "City Screen", "http://www.picturehouses.co.uk/cinema_home_date.aspx?venueId=york")
	];

	if (window.widget) 
	{
		// Restore user's selected cinema:
		var cinemaString = widget.preferenceForKey(MY_CINEMA_KEY);
		if (cinemaString && cinemaString.length > 0)
		{
			myCinema = cinemaString;
			document.getElementById("text").innerHTML = myCinema; // set title
		}

		
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
		xml_request.open("GET", getFeedSource());
		xml_request.setRequestHeader("Cache-Control", "no-cache");
		xml_request.send(null);
    }

}


function showBack(event)
{
	// your widget needs to show the back

	// Populate the drop-down list of cinemas:
	
	var select = document.getElementById("popup");
	
	
	for (i = 0; i<cinemas.length ; i++)
	{
		select.options[i] = new Option(cinemas[i].city, cinemas[i].city);
		
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


function getFeedSource()
{


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
    var selectedCinema = cinemas[select.selectedIndex].name;

	if (selectedCinema != myCinema)
	{
		myCinema = selectedCinema;
		
		// User has changed cinema so force reload and save new preference
		if (window.widget)
		{
		    widget.setPreferenceForKey(myCinema,MY_CINEMA_KEY);
		}
		
		// Change title:
		document.getElementById("text").innerHTML = myCinema;

		// This will trigger reload of listing in showFront()
		last_updated = 0;
		myCinemaChanged = true;
	}

}