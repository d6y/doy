load("doy.wdgtproj/project.wdgt/Listing.js");
load("doy.wdgtproj/project.wdgt/ListingsParser.js");

function ListingTest( name )
{
    TestCase.call( this, name );
}

function ListingTest_setUp()
{
}

function ListingTest_testCanParseFileContents() 
{
	html = readFile("tests/listing.html");
	parser = new ListingsParser();
	list = parser.findAll(html);
	
	// Make sure we have the right number of listings:
    this.assertEquals(217, list.length);

	// Check the first two...
  	this.assertEquals("Days of Glory", list[0].movie_title);
	this.assertEquals("12A", list[0].rating);
	this.assertEquals(new Date(2007,3,11).toString(), list[0].showing_date.toString());
	this.assertEquals("2:00 PM", list[0].showing_time);
	this.assertEquals("/cinema_home_date.aspx?eventId=0wq4ho%40doyb", list[0].info_url);

	this.assertEquals("Days of Glory", list[1].movie_title);
	this.assertEquals("12A", list[1].rating);
	this.assertEquals(new Date(2007,3,11).toString(), list[1].showing_date.toString());
	this.assertEquals("6:30 PM", list[1].showing_time);
	this.assertEquals("/cinema_home_date.aspx?eventId=0wq4ho%40doyb", list[1].info_url);

	// Check the last one:
	this.assertEquals("Wrong last title","Zodiac", list[216].movie_title);
	this.assertEquals("Wrong last rating","15", list[216].rating);
	this.assertEquals("Wrong last date", new Date(2007,4, 31).toString(), list[216].showing_date.toString());
	this.assertEquals("Wrong last time", "9:00 PM", list[216].showing_time);
	this.assertEquals("Wrong last URL","/cinema_home_date.aspx?eventId=g7spo1%40doyb", list[216].info_url);

}


// configuration voodoo below....

ListingTest.prototype = new TestCase();
ListingTest.prototype.setUp = ListingTest_setUp;
ListingTest.prototype.testCanParseFileContents = ListingTest_testCanParseFileContents;

function ListingTestSuite()
{
    TestSuite.call( this, "ListingTestSuite" );
    this.addTestSuite( ListingTest );
}

ListingTestSuite.prototype = new TestSuite();
ListingTestSuite.prototype.suite = function () { return new ListingTestSuite(); }

