
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

var routes = require('./routes')(app);
app.get('/:article', routes.preview);
app.get('/attachments/:attachment', routes.attachmentReferer);
app.get('/:article/attachments/:attachment', routes.attachmentDirect);

var http = require('http');
http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
