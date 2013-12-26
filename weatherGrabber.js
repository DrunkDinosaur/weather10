var Options = require('./options');
var options = new Options();
 
var request = require('request');
var redis = require("redis");
var mustache = require('mustache');
 
exports.get = function() 
{
  var redisClient = redis.createClient();
  redisClient.on('error', function (error) 
  {
    console.log('123');
    console.log('Error ' + error);
  });
  redisClient.select(options.dbIndex, function() 
  {
    redisClient.get('cities', function(error, reply) 
    {
      if (error) 
      {
        console.log('Error ' + error);
      } 
      else 
      {
        console.log('parsing cities');
        var cityList = JSON.parse(reply);
        console.log('cities = ' + cityList);
        for (var i=0; i<cityList.length; i++) 
        {   
         var url = {'url': mustache.render(options.address, {'city': cityList[i]})};
         request(url, function (error, response, body) //реквестим прогноз
         {
            if (!error && response.statusCode == 200) 
            {
              var forecast = JSON.parse(body);
              var redisClient = redis.createClient();
              redisClient.on('error', function (error) 
              {
                console.log('Error ' + error);
              });
              redisClient.select(options.dbIndex, function() 
              {      
                redisClient.set('forecast:' + forecast.city.name, JSON.stringify(forecast), redis.print); // прогноз
                redisClient.quit();
              });
            } 
            else 
            {
              console.log('Error ' + error);
            }   
          });
        }
      }
    });
  redisClient.quit();
 });
}