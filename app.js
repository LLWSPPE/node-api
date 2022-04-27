const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");
const PORT = process.env.PORT || 9000;
const http = require('http')

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const cotationsRouter = require('./routes/cotations')
const adminRouter = require('./routes/admin')
const responsableRouter = require('./routes/responsable')
require('dotenv').config()

const app = express();

app.use(cors());


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/cotations', cotationsRouter)
app.use('/admin', adminRouter)
app.use('/responsable', responsableRouter)


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.listen(process.env.API_PORT, console.log(`Server started on port ${process.env.API_PORT}`));

module.exports = app;
