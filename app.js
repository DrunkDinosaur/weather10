var Options = require('./options');
var weatherGrabber = require('./weatherGrabber');
var redis = require("redis");
var mustache = require('mustache');
var express = require('express');
var app = express();

var initializer = require('./initializer')
initializer.initialize(); //пихаем в бд города и хтмл

var options = new Options();
weatherGrabber.get(); //запрашивает прогноз


app.use("/public", express.static(__dirname + '/public')); //нужно чтобы подхватить css-ки

//по гетам 
//http://www.hacksparrow.com/express-js-tutorial.html
//http://www.hacksparrow.com/post-get-request-handling-in-node-js-express.html
//essential training 5 глава

//вылезет по http://localhost:3000/get?<всякая фигня>
app.get('/get', function(req, res)
{ 
  var query = {
    'city': req.query.city || 'Nizhniy Novgorod', 
    'days': req.query.days || 10, 
    'align': (!req.query.align) ? 'Horizontal' : req.query.align // по умолчанию - горизонтальная
  };
  
  var client = redis.createClient();
  client.on('error', function (err) 
  {
    console.log('app.js client.on error ' + err);
  });
  client.select(options.dbIndex, function() 
  {
    client.get('forecast:' + query.city, function(err, reply) //запил ключа для вытаскивания погоды для конкретного города
    {
    if (err) 
    {
      console.log('app.js client.get error  ' + err);
    } 
    else 
    {
      var forecast = JSON.parse(reply);      
      var view = {'align': query.align, 'city': query.city, 'days':[]};
      for (var i=0; i<query.days; i++) 
      {
        var obj = {
        'dt': new Date(forecast.list[i].dt * 1000).toLocaleDateString(),
        'morning': Math.round(forecast.list[i].temp.morn), 
        'day': Math.round(forecast.list[i].temp.day), 
        'evening': Math.round(forecast.list[i].temp.eve), 
        'night': Math.round(forecast.list[i].temp.night), 
        };
        view.days.push(obj);
      }   
      client.get(options.dbCellKey, function(err, cell) 
      {
         if (err) 
        {
          console.log('Error ' + err);
        } 
        else 
        {
          var output = mustache.render(cell, view); //запиливаем в хтмл
          res.send(output);
        }
      });    
    }
    client.quit();
  });
 });
});
 
//вылезет по http://localhost:3000/
//для изменения - put
app.get('/', function(req, res)
{ 
  weatherGrabber.get(); //запрашиваем прогноз при подключении
  var client = redis.createClient();
  client.on('error', function (err) 
  {
    console.log('Error ' + err);
  });
  client.select(options.dbIndex, function() 
  {
    client.get(options.dbCitiesKey, function(err, reply) 
    {
      if (err) 
      {
        console.log('Error ' + err);
      } 
      else 
      {
        var cities = JSON.parse(reply);
        var view = {'cities':[]};
        for (var i=0; i<cities.length; i++) 
        {
          view.cities.push({'city': cities[i]});
        }
        client.get(options.dbFrontKey, function(err, cell) 
        {
          if (err) 
          {
            console.log('Error ' + err);
          } 
          else 
          {
            var output = mustache.render(cell, view);
            res.send(output);
          }
        });    
      }
    client.quit();
    });  
  });
});
 
app.listen(options.port);
console.log('Listening on port ' + options.port);
 
