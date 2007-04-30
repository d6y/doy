/**
The idea here is to scan throgh the HTML text looking for the days
and the films showing on each of those days.  Before reading this code take
a look a listing.html to become familiar with the structure of the HTML.

This code will almost certainly fail horribly when the DoY next change
their web site.  But, fingers crossed, they'll add an ATOM feed and most
of the code can just be deleted.

The core concepts are that the HTML from DoY is considered to be a page full
of "Listing"s - a fim title on a particular date and time.  The ListingsParser
reads the HTML page and processeds them into Listing objects.  In fact
that's what findAll() does.  But you can do other things: the findMovies()
function turns the listings into Movie objects: a film title containing
a list of dates each of which is a list of showing times.

*/

function ListingsParser()
{
}


/**
The output of this function is a flat array of Listing objects.
*/
ListingsParser.prototype.findAll = function(text)
{
		var movies = [];
		this.parse( text, function(listing) { movies[movies.length] = listing; } ); 
		return movies;
};


/**
Find all movies and keep a list of showtimes with the movie.

The result is a hash keyed on title, with a value of a Movie object.

Example usage:

	list = parser.findMovies(html);
	for(var m in list)
	{
		var movie = list[m];
		print(movie.movie_title + " Rating "+movie.rating);
		for(var d in movie.showing_dates)
		{
			var times = movie.showing_dates[d.toString()];
			print("   "+d+" @ "+times);
		}
	}


*/
ListingsParser.prototype.findMovies = function(text, base_url)
{
		var movies = {};
		
		// XXX Proper URL resolving would be nicer...
		var site_url = base_url.match(/^(\w+:\/\/[^\/]+)/)[1];
		
		this.parse( text, 
			function(listing) 
			{ 
				var m = movies[listing.movie_title];
				if (m == undefined)
				{
					m = new Movie(listing.movie_title, listing.rating, site_url + listing.info_url);
					movies[listing.movie_title] = m;
				}
				
				m.addShowing(listing.showing_date, listing.showing_time);
				
			} ); 
			
		return movies;
};



/**
 The guts of the HTML parsing is made up of a bunch of regular
 expressions.  When a listing is found it is passed to the 
 callback function.

 @param text the raw HTML from the Duke of Yorks web site (see listing.html for
	  example text).
	
 @param callback a function to call each time a listing is found.  The signature
      is: callback(listing)
*/
ListingsParser.prototype.parse = function(text, callback)
{

	// The listings HTML is structued by date, with the dates inside H5s:
	var dayRe = /<h5[^>]*>(\w+) (\d+) (\w+) (\d+)<\/h5>/gi;
	
	// For each day...
	while ( (dateParts = dayRe.exec(text)) != undefined  )
	{
		var date = this.createDate(dateParts);
		var dateAsInHtml = dateParts.slice(1).join(" ");
		
		// Find the subsection of HTML that contains the listing for the day. I.e.,
		// the text between the date and the next <h5> tag.
		var datePos = text.indexOf(dateAsInHtml);
		var nextDate = text.indexOf("<h5", datePos);
		if (nextDate == -1) 
		{
			// last day, probably, so just read to the end of the text
			nextDate = text.length;
		}
		
		// The listings for the day are inside this text block:
		var dayListings = text.substring(datePos, nextDate);
		
		// Pull out the listing details from the text block.
		// NB: each FilmListingFilmTitle is followed by one or more FilmListingTime links.
		var listingRe = /class="FilmListingFilmTitle" href="([^"]+)">(.+?)<\/a><\/p>\s*<p class="FilmListingTime">(.+)<\/p>/gm;
		var timeRe = /class="(FilmListingTime|FilmListingTimeSoldOut)"[^>]*>([^<]+)</gm;
		
	    // For each film on the day...
		// NB: !== used here will cause the unit tests to fail under Rhino. 
		while ( (links = listingRe.exec(dayListings)) != undefined)
		{
			var url = links[1]; // relative URL for info about the film
			var title = links[2];

			var rating = null;
			
			// format for the title seems to be: "title (rating)" or "title"
			var openBrace = title.lastIndexOf("(");
			if (openBrace != -1 && links[2].indexOf(")", openBrace) != -1)
			{
				rating = title.substring(openBrace+1,title.length-1);
				title = title.substring(0,openBrace-1);
			}
			
			while ( (times = timeRe.exec(links[3])) != undefined)
			{
				// var type = times[1]; // FilmListingTime or FilmListingTimeSoldOut
				var showingTime = times[2]; // e.g., "9:00 PM"
			
				callback( new Listing(title, rating, date, showingTime, url) );
				
			} //end while each time
			
		} // end while each movie
		
    } // end while each day		
	
};

/**
Helper to convert an array of date parts into a Date object.

@param dateParts array of date elements, e.g., "Wednesday 18 April 2007",
  "Wednesday", "18", "April", "2007".
*/
ListingsParser.prototype.createDate = function(dateParts)
{
	var monthNames = { "January":0, "February":1, "March":2, "April":3, "May":4,
					   "June":5, "July":6, "August":7, "September":8, "October":9,
					   "November":10, "December":11};

	return new Date(dateParts[4],monthNames[dateParts[3]],dateParts[2] );
};

