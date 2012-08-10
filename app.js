
/**
 * Module dependencies.
 */

var express = require('express');
var app = express();
var CONFIG = require('./config.js');

app.configure(function(){
  app.set('CONFIG', CONFIG);
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('article', __dirname + '/article')
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.locals({
  markup: require('markdown-js').parse,
  CONFIG: CONFIG
});

if (process.env.MODE === 'SERVER') {
  var Server = require('mongodb').Server;
  var Db = require('mongodb').Db;
  db = new Db('nmblog', new Server('127.0.0.1', 27017, {auto_reconnect: true}));
  db.open(function (err, db) {
    if (!err) {
      var mountCollections = require('mount-collections');
      mountCollections(db, ['article'], function (err, db) {
        var routes = require('./routes')(app, db);
        app.get('/', routes.index);
        app.get('/:article', routes.show);
        app.get('/attachments/:attachment', routes.attachmentReferer);
        app.get('/:article/attachments/:attachment', routes.attachmentDirect);
        app.post('/listenPost/:article', routes.listenPost);

        console.log('Server Mode ...');
        var http = require('http');
        http.createServer(app).listen(app.get('port'), function() {
          console.log("Express server listening on port " + app.get('port'));
        });
      });
    }
  });
} else {
  var routes = require('./routes')(app);
  app.get('/test', routes.test);
  app.get('/:article', routes.preview);
  app.get('/article/:article/:format', routes.article);
  app.get('/article/:article/attachments/:attachment', routes.attachment);
  app.post('/post/:article', routes.post);

  console.log('Client Mode ...');
  var http = require('http');
  http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
  });
}
