var createError = require('http-errors');
var express = require('express');
var mongoose=require('mongoose');
var path = require('path');
var cookieParser = require('cookie-parser');
var compression = require('compression');
var helmet = require('helmet');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI.toString(),{ useNewUrlParser: true , useUnifiedTopology: true});
var db=mongoose.connection;
db.on('error',console.error.bind(console,'MongoDB connection error'))

var indexRouter = require('./routes/index');
var catalogRouter = require('./routes/catalog');

var app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/catalog',catalogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
