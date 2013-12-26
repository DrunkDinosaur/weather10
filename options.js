module.exports = function ()
{
	this.fsCities = 'cities.txt',
	this.dbCitiesKey = 'cities',
	this.fsCell = 'cell.html',
	this.dbCellKey = 'cell',
	this.fsFront = 'front.html', //formpath
	this.dbFrontKey = 'form',
	this.dbIndex = 1,
	this.address = 'http://api.openweathermap.org/data/2.5/forecast/daily?q={{city}}&units=metric&cnt=10',
	this.port = 3000
}