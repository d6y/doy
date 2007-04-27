load("doy.wdgtproj/project.wdgt/Listing.js");
load("doy.wdgtproj/project.wdgt/Movie.js");
load("doy.wdgtproj/project.wdgt/ListingsParser.js");

function MovieTest( name )
{
    TestCase.call( this, name );
}

function MovieTest_setUp()
{
}

function MovieTest_testCanConvertDateAndTimeIntoDateObject() 
{
	var today = new Date(2007, 0, 1);
	
	var m = new Movie();
	
	this.assertEquals(new Date(2007,0,1,21,00).getTime(), m.makeDateTime(today, "9:00 PM").getTime() );
	this.assertEquals(new Date(2007,0,1,11,30).getTime(), m.makeDateTime(today, "11:30 AM").getTime() );
	
}


function MovieTest_testCanTrim() 
{

	var today = new Date(2007, 0, 1);

	var movie = new Movie("When Code Goes Bad", "18", "url goes here");
	movie.addShowing( today, "11:00 AM" );
	movie.addShowing( today, "9:30 PM" );
	
	this.assertEquals("Movie sanity check failed", 1, movie.orderedDates().length);
	this.assertEquals("Showing sanity check failed", 2, movie.showingsOn(today).length);
	
	
	// If it's 9PM now, we should only have one showing left:
	var now = new Date(2007, 0, 1, 21, 0, 0);
	movie.trimTo(now);

	this.assertEquals("Expected one date", 1, movie.orderedDates().length);
		
	var showings = movie.showingsOn(today);
	this.assertEquals("Wrong number of showings on 2007/01/01", 1, showings.length);
	
	this.assertEquals("9:30 PM", showings[0]);
	


}

MovieTest.prototype = new TestCase();
MovieTest.prototype.setUp = MovieTest_setUp;
MovieTest.prototype.testCanTrim = MovieTest_testCanTrim;
MovieTest.prototype.testCanConvertDateAndTimeIntoDateObject = MovieTest_testCanConvertDateAndTimeIntoDateObject;

function MovieTestSuite()
{
    TestSuite.call( this, "MovieTestSuite" );
    this.addTestSuite( MovieTest );
}

MovieTestSuite.prototype = new TestSuite();
MovieTestSuite.prototype.suite = function () { return new MovieTestSuite(); }

