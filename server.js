var express     = require('express'),
    app         = express(),
    bodyParser  = require('body-parser'),
    morgan      = require('morgan'),
    mongoose    = require('mongoose'),
    passport	  = require('passport'),
    config      = require('./config/database'), // get db config file
    User        = require('./app/models/user'), // get the mongoose model
    port 	      = process.env.PORT || 8080,
    jwt 			  = require('jwt-simple');

// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize());

// demo Route (GET http://localhost:8080)
app.get('/', function(req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});

//CONNECT TO DB
mongoose.connect(config.database);

//pass PASSPORT TO CONFIG
require('./config/passport')(passport);

//BUNDLE ROUTES
var apiRoutes = express.Router();
////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///CREATE NEW User ACCOUNT(POST http://localhost:8080/api/signup)
apiRoutes.post('/signup', function(req, res) {
  if (!req.body.name || !req.body.password) {
    res.json({succes: false, msg: 'Please pass name and password.'});
  } else {
    var newUser = new User({
      name: req.body.name,
      password: req.body.password
    });
    //SAVE User
    newUser.save(function(err) {
      if (err) {
        res.json({succes: false, msg: 'Username already exists.'});
      } else {
        res.json({succes: true, msg: 'Successful created user!'});
      }
    });
  }
});

//*ROUTE TO AUTHENTICATE User (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {
  User.findOne({
    name: req.body.name
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      //check IF User password matches
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (isMatch && !err) {
          //IF User is found and password is correct create a token!
          var token = jwt.encode(user, config.secret);
          //return the info including the token as JSON
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

//ROUTE to RESTRICTEd info GET http:localhost:8080/api/memeberinfo
apiRoutes.get('/memberinfo', passport.authenticate('jwt', {session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
      } else {
        return res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
      }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});

getToken = function(headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

//CONNECT THE API ROUTES UNDER /api/*
app.use('/api', apiRoutes);

// Start the server
app.listen(port);
console.log('There will be dragons: http://localhost:' + port);
