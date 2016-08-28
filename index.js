var express = require('express');
var fs = require('fs');
var Datastore = require('nedb');
var bodyParser = require('body-parser');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;

var random;
var app = express();

passport.use(new Strategy({
    consumerKey: process.env['twitterkey'],
    consumerSecret: process.env['twittersecret'],
    callbackURL: 'https://soirana-quizzes.herokuapp.com/twitter/return'

  },
  function(token, tokenSecret, profile, cb) {
    return cb(null, profile);
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

var db = new Datastore({ filename: 'quiz.db', autoload: true });
var dbuser = new Datastore({ filename: 'quizusers.db', autoload: true });
app.use(bodyParser.json())
app.use(require('cookie-parser')());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'board whelp', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

var html = fs.readFileSync('quizes/start.html');


app.use(express.static('quizes'));
app.set('port', (process.env.PORT || 5000));



app.get('/twitter', passport.authenticate('twitter'));

app.get('/twitter/return',
	passport.authenticate('twitter', { failureRedirect: '/twitter' }), 
  		function(req, res) {
        dbuser.find({user: req.user.username},function(err, docs) {
          var statArray = [0,0];
          if (docs.length>0) {
            statArray = docs[0].stats
          } else{
            dbuser.insert({user: req.user.username, stats: [0,0]});
          }
          res.json({error: false, name: req.user.username, stats: statArray
          });
        });

        
  }); 


app.get('/upload', function(request, response) {
  console.log('WTF');
  if ( request.xhr) {
    db.find({question: request.query.question},function(err, docs) {
      if (docs.length>0) {
        response.json({error: "name taken"});
      }else{
        db.insert(request.query);
        response.json({error: false});
      }
    });

  } else{
    response.redirect('/');
  }
});

app.get('/show', function(request, response) {
  if ( request.xhr) {
    db.find({},function(err, docs) {
      if (docs.length === 0) {
        response.json({error: 'no questions in database'})
      }
      if (request.query.user === 'false') {
        random = Math.floor(Math.random()*docs.length);
        delete docs[random].answered;
        response.json({error: false, poll: docs[random]});
        return;
      }
      var i = 50;
      var check = false;
      while(i >0){
        random = Math.floor(Math.random()*docs.length);
        i--;
        if (docs[random].answered.indexOf(request.query.user)=== -1){
          check = true;
          delete docs[random].answered;
          response.json({error: false, poll: docs[random]});
          i=0;
        }
      }
      if (check) {return;}
      for (var i = 0; i < docs.length; i++) {
        if (docs[i].answered.indexOf(request.query.user)=== -1){
          delete docs[i].answered;
          response.json({error: false, poll: docs[i]});
          return;
        }
      }
      response.json({error: 'Congrats - answered all questions.'});
     
    });

  } else{
    response.redirect('/');
  }

});

app.get('/clean', function(request, response) {
  if ( request.xhr) {
    dbuser.update({user: request.query.user}, { $set: { stats: [0,0] } }, { multi: true },function(err, numReplaced) {
      if (err){
        response.json({error: err});
      } else{
        response.json({error: false});
      }

    });

  } else{
    response.redirect('/');
  }
});

app.get('/updateStats', function(request, response) {
  if ( request.xhr) {
    dbuser.update({user: request.query.user}, { $set: { stats: request.query.stats } }, { multi: true },function(err, numReplaced) {
      if (err){
        response.json({error: err});
      } else{
        response.json({error: false});
      }
    });
    db.update({ question: request.query.question }, { $push: { answered: request.query.user} }, {}, function () {
  // Now the fruits array is ['apple', 'orange', 'pear', 'banana']
});

  } else{
    response.redirect('/');
  }
});










app.get('/', function(request, response) {
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.end(html);
});


app.get('/*', function(request, response) {
			response.redirect('/');
});




app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

