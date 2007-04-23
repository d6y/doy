//  harness to run under Rhino

load("doy.wdgtproj/project.wdgt/Listing.js");
load("doy.wdgtproj/project.wdgt/Movie.js");
load("doy.wdgtproj/project.wdgt/ListingsParser.js");


html = readFile("tests/listing.html");

// print(html);

parser = new ListingsParser();

// FIND ALL LISTINGS IN THE HTML:

list = parser.findAll(html);

for(i=0; i<list.length; i++)
{
	print(i+") " + list[i].movie_title
		+" " + list[i].showing_date + "@" + list[i].showing_time );
}


// FIND ALL MOVIES IN THE HTML:

list = parser.findMovies(html);
for(var m in list)
{
	var movie = list[m];
	print(movie.movie_title + " Rating "+movie.rating);
	var dates = movie.orderedDates();
	for(i = 0; i<dates.length; i++)
	{
		var d = dates[i];
		var times = movie.showing_dates[d.toString()];
		print("   "+d.getDate()+"/"+(1+d.getMonth())+"/"+d.getFullYear()+" @ "+times);
		
	}
}
