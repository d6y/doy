/**
Container for the information about a movie (title, when it is showing)
*/
function Movie(title,rating,url)
{
	this.movie_title = title;
	this.rating = rating;
	this.showing_dates = {}; //hash: key=date, value=list of times, format "HH:MM AM|PM"
	this.ordered_dates = []; 
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
};


Movie.prototype.showingsOn = function (date)
{
	return this.showing_dates[date];
};

/*
  Remove any dates form this movie that are before
  the given date (i.e., remove dates that have passed).
*/
Movie.prototype.trimTo = function (now)
{
    var now_milliseconds = now.getTime();

	// build up a new list of ordered dates (the ones left after trimming)
	var new_dates = [];
	
	var n = this.ordered_dates.length;
	for(i=0; i<n; i++)
	{
		var date = this.ordered_dates[i];
		var showing_times = this.showing_dates[date];
		
		// Build up a new list of showing times (the ones left after trimming)
		var new_showing_times = [];

		var m=showing_times.length;
		for(j=0; j<m; j++)
		{
			// Convert time and date into a Date object
			var showing_date_time = this.makeDateTime(date, showing_times[j]);
	
			if (showing_date_time.getTime() >= now_milliseconds)
			{
				// only keep future showings
				new_showing_times[new_showing_times.length] = showing_times[j];
			}
	
		} //end for times

		// only keep dates that have some showing times.
		if (new_showing_times.length > 0)
		{
			new_dates[new_dates.length] = date;
			this.showing_dates[date] = new_showing_times;	
		}
		
						
	} //end for dates
	
	this.ordered_dates = new_dates;
	
};

/*
Convert a date plus a time string such as 09:00 PM
into a Date object that represents the date and time.
*/
Movie.prototype.makeDateTime = function(date, timeString) 
{
    var time_regexp = /(\d+):(\d+) (\w+)/;
    var time_parts = time_regexp.exec(timeString);

	var hour = parseInt(time_parts[1]);
	var min = time_parts[2];
	
	if ("PM" == time_parts[3])
	{
		hour = (hour + 12);
	}

	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, min);

};






