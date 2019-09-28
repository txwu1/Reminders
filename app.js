const dotenv = require('dotenv').config();
var express = require('express');
var app = express();

var passport = require('passport');
var Strategy = require('passport-local').Strategy;

var admin = require('firebase-admin');

var bodyParser = require('body-parser');
var routes = require('./routes/router');
var api = require('./routes/api');

var scheduler = require('node-schedule');

passport.use(new Strategy({
        usernameField: "email",
        passwordField: "password",
    },
    function(email, password, cb){
        let users = require('./database/users');
        users.findByEmail(email, function(err, user) {
            if (err) { return cb(err); }
            if (!user) { return cb(null, false); }
            // use bcrypt to compare with hashed password
            const bcrypt = require('bcrypt');
            bcrypt.compare(password, user.password, function(err, res) {
                if (res){
                    return cb(null, user);
                } else {
                    return cb(null, false);
                }
            });
        });
    }
));

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
  });
  
passport.deserializeUser(function(id, cb) {
    let users = require('./database/users');
    users.findById(id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});

admin.initializeApp({
    credential: admin.credential.cert({
        "projectId": process.env.PROJECT_ID,
        "private_key": process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
        "clientEmail": process.env.CLIENT_EMAIL
    }),
    databaseURL: process.env.DATABASE_URL
});

/*

var fb = require('firebase');

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
};

fb.initializeApp(firebaseConfig);
*/
app.use(express.static(__dirname + '/client/build'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', api);
app.use('/', routes);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
});

// start scheduler to check reminders/send out emails
var s = scheduler.scheduleJob('10 0 * * *', function(){
    let main = require('./database/reminders');
    main();
})
/*
let s = new Date(Date.now() + 1000);
console.log(s);
g = s.getSeconds().toString() + ' ' + s.getMinutes().toString() + ' ' + s.getHours().toString() + ' * * *';
var sc = scheduler.scheduleJob(g, function(){
    console.log('scheduler executing task');
    let main = require('./database/reminders');
    main();
}); */


module.exports = {
                    app: app,
                    admin: admin,
                    passport: passport
                };

