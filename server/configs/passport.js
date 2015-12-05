// config/passport.js

var FacebookStrategy = require('passport-facebook').Strategy;

var FacebookTokenStrategy = require('passport-facebook-token').Strategy;

var configAuth = require('./auth');

module.exports = function (passport, db) {
//    // used to serialize the user for the session
//    passport.serializeUser(function(user, done) {
//        console.log("serializeUser " + user);
//        done(null, user._id);
//    });
//
//    // used to deserialize the user
//    passport.deserializeUser(function(id, done) {
//        console.log("deserializeUser " + id);
//        db.users.findOne({_id:mongojs.ObjectId(id)},function(err, user) {
//            done(err, user);
//        });
//    });

    passport.use(new FacebookTokenStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret
        }, function (accessToken, refreshToken, profile, done) {
            console.log("Inside the facebook-token strategy");
            console.log(JSON.stringify(profile));
            db.users.findOne({ 'auth.facebook.id': profile.id }, function (err, user) {
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    //todo:overwrite the users current object so that we are getting the most up to date info

                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser = {
                        auth: {
                            facebook: {}
                        }
                    };
                   // console.log(JSON.stringify(profile));
                    // set all of the facebook information in our user model
                    newUser.auth.facebook.id = profile._json.id; // set the users facebook id
                    newUser.auth.facebook.token = accessToken; // we will save the token that facebook provides to the user
                    newUser.name = profile._json.name; // look at the passport user profile to see how names are returned
                    newUser.auth.email = profile._json.email; // facebook can return multiple emails so we'll take the first
                    newUser.gender = profile._json.gender;

                    // save our user to the database
                    db.users.insert(newUser, function (err, user) {
                        if (err) {
                            return done(err);
                        } else {
                            return done(null, user);
                        }
                    });
                }
            });
        }
    ));




    console.log("Finished configuring passport");
};
 	