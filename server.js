var express = require('express');
var cors = require('cors')

var app = express();
var port = process.env.PORT || 9000;

var mongojs = require('mongojs');


app.set('jwtTokenSecret', 'UMBRELLA_secret');
var passport = require('passport');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
//var session      = require('express-session');



//app.use('/RedditHeadlines',express.static(__dirname+ '/RedditHeadlines/app'));
//app.use('/41Thieves', express.static(__dirname + '/41Thieves'));
//app.use('/Umbrella', express.static(__dirname + '/Umbrella/app'));
app.use(express.static(__dirname + '/app'));


// set up our express application
app.use(cors());
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.disable('etag');

// required for passport
// app.use(session({ secret: 'sessionsecret' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
// app.use(flash()); // use connect-flash for flash messages stored in session

var databaseUrl = "umbrella"; // "username:password@example.com/mydb"
var collections = ["bars", "categories", "users", "checkins", "neighborhoods"];
var db = mongojs.connect(databaseUrl, collections);

require('./server/configs/passport.js')(passport,db); // pass passport for configuration
require('./server/route.js')(app, db, passport);

app.listen(port);
console.log('App listening on port ' + port);


