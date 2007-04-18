/**
Container for the information about a movie (title, when it is showing)
*/
function Movie(title,rating,url)
{
	this.movie_title = title;
	this.rating = rating;
	// Hash: key=date string, value=list of times
	this.showing_dates = new Object(); 
	this.ordered_dates = new Array();
	this.info_url = url;
}

Movie.prototype.addShowing = function(date,time)
{
	var times = this.showing_dates[date];
	
	if (times == undefined)
	{
		times = [];
		this.showing_dates[date] = times;
	}
	
	times[times.length] = time;
	
	// Update the ordered list.  As luck would have it, we add them
	// in date order (currently)
	var n = this.ordered_dates.length;
	for(i=0; i<n; i++)
	{
		if (date == this.ordered_dates[i])
		{
			return; // already in the list, so we're done.
		}
	}
	
	this.ordered_dates[n] = date;
	
};


Movie.prototype.orderedDates = function()
{
	return this.ordered_dates;
}


Movie.prototype.movie_title;
Movie.prototype.showing_dates;
Movie.prototype.info_url;
Movie.prototype.rating;



