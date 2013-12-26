//insex.js, где пихаем в бд виджет, список городов и шаблон прогноза

var Options = require('./options');
var options = new Options();
 
var fs = require('fs');
var redis = require("redis");
 
console.log('index.js');

exports.initialize = function()
{
  init(options.fsCities, options.dbCitiesKey, options.dbIndex);
  init(options.fsCell, options.dbCellKey, options.dbIndex);
  init(options.fsFront, options.dbFrontKey, options.dbIndex);
}
 
function init(fsPath, key, dbIndex) 
{
 fs.exists(fsPath, function(exists) 
 {
    if (!exists) //есть ли файл
    {
      console.log('index.js: fs.exists error ' + fsPath);
    } 
    else 
    {
      fs.readFile(fsPath, function(error, content)
      {
        if (error) 
        {
          console.log('index.js: fs.readFile error: ' + fsPath);
        } 
        else 
        {
          var client = redis.createClient(); //redis on
          client.on("error", function (error) 
          {
            console.log("index.js: redis.client.on error " + error); 
          });
          client.select(dbIndex, function()  
          {     //по индексу хранилища
            var value = (key == 'cities') ? JSON.stringify(String(content).replace(/^\s+/, "").split(/\s*,\s*/)) : String(content).replace(/^\s+/, "");     
            console.log('value = ' + value );
            client.set(key, value, redis.print);     
            client.quit();
          });
        }
      });
    }
  });
}