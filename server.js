var express = require('express');
var mysql = require('mysql');
var dbsql = require('./dbcon')
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var request = require('request');



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('port', 4687);

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');



app.post('/insert',function(req,res,next){
  var context = {};
  dbsql.pool.query("INSERT INTO workouts (`name`,`reps`,`weight`,`date`,`lbs`) VALUES (?,?,?,?,?)", [req.body.name, req.body.reps, req.body.weight, req.body.date, req.body.lbs], function(err, result){
    if(err){
      next(err);
      return;
    }
    context.results = "Inserted id " + result.insertId;
    res.render('home',context);
  });
});

app.get('/safe-update',function(req,res,next){
  var context = {};
  dbsql.pool.query("SELECT * FROM todo WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];
      mysql.pool.query("UPDATE work SET name=?, done=?, due=? WHERE id=? ",
        [req.query.name || curVals.name, req.query.done || curVals.done, req.query.due || curVals.due, req.query.id],
        function(err, result){
        if(err){
          next(err);
          return;
        }
        context.results = "Updated " + result.changedRows + " rows.";
        res.render('home',context);
      });
    }
  });
});

app.get('/reset-table',function(req,res,next){
  var context = {};
  dbsql.pool.query("DROP TABLE IF EXISTS workouts", function(err){
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    dbsql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.end("success");
    })
  });
});


app.get('/load',function(req,res,next){
var context = {};
  dbsql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    context.results = JSON.stringify(rows);
    res.send(context.results);
  });
});

app.get('/',function(req,res,next){
    res.render('home');
});

app.use(function(req,res){ //error handlers and other shtuff that hangs out down here
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
