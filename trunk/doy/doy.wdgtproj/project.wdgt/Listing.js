/**
Container for the information about a film showing (title, date, time).
*/
function Listing(title,rating,date,time,url)
{
	this.movie_title = title;
	this.rating = rating;
	this.showing_date = date;  // Date object
	this.showing_time = time;  // String eg., "6PM"
	this.info_url = url;
}

Listing.prototype.movie_title;
Listing.prototype.rating;
Listing.prototype.showing_date;
Listing.prototype.showing_time;
Listing.prototype.info_url;


