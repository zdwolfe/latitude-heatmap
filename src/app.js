var express        = require('express');
var passport       = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var http           = require('http');

var google         = require('./google');
var latitude       = require('./latitude');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: google.clientID,
    clientSecret: google.clientSecret,
    callbackURL: google.callbackURL
  },
    function(accessToken, refreshToken, profile, done) {
        profile.accessToken = accessToken;
        return done(null, profile);
    }
));

var app = express(); 

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/oauth2',
  passport.authenticate('google', { scope: google.scope}),
  function(req, res){
  });

app.get('/oauth2/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
            res.redirect('/heatmap');
    });

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.get('/heatmap', function(req, res) {
    res.render('heatmap');
});

app.get('/data', function(req, res) {
    d = {};
    console.log("/data query = " + JSON.stringify(req.query));
    d.oldest = req.query.oldest;
    d.newest = req.query.newest;
    d.accesstoken = req.user.accessToken;
    latitude.getData(d, function(data) {
        res.json(data);
    });
});

app.listen(3000);
console.log("listening on 3000");

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}
