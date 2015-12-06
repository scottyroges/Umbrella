var http = require('http');
var https = require('https');
var request = require('request');
var nodemailer = require("nodemailer");
var mongojs = require('mongojs');

var bcrypt = require('bcrypt-nodejs');
var passwordGen = require("randomstring");
var jwt = require('jwt-simple');
var jwtauth = require('./jwtauth.js');


module.exports = function (app, db, passport) {
    jwtauth.setVariables(app, db);

    /*******AUTH ********/

    app.post('/service/login', function (req, res) {
        console.log('umbrella :: service :: login');
        var email = req.body.email;
        var password = req.body.password;
        db.users.findOne({ 'auth.email': email }, function (err, user) {
            if (err) {
                console.log('Error finding the user');
                return res.json(500, { message: "Error finding user" });
            }
            if (!user) {
                console.log('No user found with that email');
                return res.json(401, { message: "No user found with that email" });
            } else {
                console.log('Found the user');
                if (!bcrypt.compareSync(password, user.auth.local.password)) {
                    console.log("Incorrect password");
                    return res.json(401, { message: "Incorrect password" });
                } else {
                    console.log("Authentication passed");
                    var token = jwt.encode({
                        iss: user._id
                    }, app.get('jwtTokenSecret'));
                    console.log("Returning a token");
                    return res.json(200, { token: token, user: user });
                }
            }

        });
    });

//    app.post('/service/login-facebook', passport.authenticate('facebook-token', {session: false}),
//        function (req, res) {
//            console.log('umbrella :: service :: facebook-login');
//            if(req.user){
//                console.log('facebook returned a user');
//                var token = jwt.encode({
//                    iss: req.user._id
//                }, app.get('jwtTokenSecret'));
//                console.log("Returning a token");
//                return res.json(200, { token: token, user: req.user });
//            }
//            else {
//                console.log('issue with facebook login');
//                return res.send(401, "failed facebook login");
//            }
//        }
//    );

//    app.get('/service/validate', jwtauth.auth, function (req, res) {
//        console.log('umbrella :: service :: validate');
//        return res.send(200, req.user);
//    });

    app.post('/service/colors', function(req,res){

//       query for all the bars within a give coordinate polygon
//       from those bars find all the checkins at those bars
//       aggrate all the users in those checkins and see which demographic has the most colors
//       return color
//       potentially add in another parameter to filter by

        var timeRange = 12;
        timeRange = req.query.range;

        var attributes = req.body;
        var field = req.query.field;
        var seeAll = req.query.seeAll;

        db.categories.findOne({_id: mongojs.ObjectId(req.query.id)}, function(err,cat){

                var colors = [];
                var count = 0;
                for(var i = 0; i < cat.neighborhoods.length; i++){
                    db.neighborhoods.findOne({_id:cat.neighborhoods[i]},function(err, neighborhood){
                       count++;

                       neighborhood.bars = [];
                       if(attributes){
                           neighborhood.count = 0;
                       } else if (field){
                           if(field === "gender"){
                               neighborhood.count = {
                                   male : 0,
                                   female : 0
                               };
                           } else if (field === "status"){
                               neighborhood.count = {
                                   single : 0,
                                   relationship: 0,
                                   married :0
                               };
                           } else if (field === "orientation"){
                               neighborhood.count = {
                                   straight:0,
                                   gay:0,
                                   bi:0
                               }
                           } else if (field === "age"){
                               neighborhood.count = {
                                   age_20_25: 0,
                                   age_25_30: 0,
                                   age_30_40: 0,
                                   age_40_: 0
                               };
                           }
                       } else if(seeAll === true) {
                           neighborhood.count = {
                               male: 0,
                               female: 0,

                               single: 0,
                               married: 0,
                               relationship: 0,

                               age_20_25: 0,
                               age_25_30: 0,
                               age_30_40: 0,
                               age_40_: 0,

                               gay: 0,
                               straight: 0,
                               bi: 0
                           };
                       }
                       colors.push(neighborhood);
                       if(count === (cat.neighborhoods.length )){
                            var current = new Date();
                            var range = new Date();
                            range.setHours(current.getHours()-timeRange);

                            if(attributes){ //attributes counter
                                var query = attributes;

                                query.datetime =  {$gte: range};
                                console.log(query);

                                db.checkins.find(query, function (err,checkins){
                                    console.log("Number of checkins " + checkins.length);
                                    var count2 = 0;
                                    for (var j = 0; j < checkins.length; j++) {
                                        var elementPos = colors.map(function (x) {
                                            return JSON.stringify(x._id);
                                        }).indexOf(JSON.stringify(checkins[j].bar.neighborhood.id));
                                        var bar = {
                                            id: checkins[j].bar.id,
                                            name: checkins[j].bar.name,
                                            location: checkins[j].bar.location
                                        };
                                        colors[elementPos].bars.push(bar);
                                        colors[elementPos].count = colors[elementPos].count + 1;
                                        count2++;
                                        if (count2 === checkins.length) {
                                            //#FF0000 red
                                            //#0000FF blue
                                            var field_array = [];
                                            for (var x = 0; x < colors.length; x++) {
                                                field_array.push(colors[x].count);
                                            }
                                            var min = Math.min.apply(null, field_array);
                                            var max = Math.max.apply(null, field_array);
                                            var range = max - min;

                                            for (var x = 0; x < field_array.length; x++) {
                                                var difference = field_array[x] - min;
                                                var percent = difference / range;

                                                var value = 1 - percent;
                                                if (value > .5) {
                                                    var diff = value - .5;
                                                    var per = diff / .5;
                                                    var per2 = .15 * per;
                                                    value = per2 + .85;
                                                    var hue = ((value) * 240);
                                                    colors[x].color = "hsl(" + hue + ",100%,50%)";
                                                } else {
                                                    var per = value / .5;
                                                    var per2 = .1 * per;
                                                    value = per2;
                                                    var hue = ((value) * 120);
                                                    colors[x].color = "hsl(" + hue + ",100%,50%)";
                                                }
                                            }

                                            return res.send(200, colors);
                                        }
                                    }
                                });
                            } else {
                                db.checkins.find({datetime: {$gte: range}}, function (err, checkins) {
                                    console.log("Number of checkins " + checkins.length);
                                    var count2 = 0;
                                    for (var j = 0; j < checkins.length; j++) {
                                        var elementPos = colors.map(function (x) {
                                            return JSON.stringify(x._id);
                                        }).indexOf(JSON.stringify(checkins[j].bar.neighborhood.id));
                                        var bar = {
                                            id: checkins[j].bar.id,
                                            name: checkins[j].bar.name,
                                            location: checkins[j].bar.location
                                        };
                                        colors[elementPos].bars.push(bar);

                                        if (checkins[j].user.gender === 'male') {
                                            colors[elementPos].count.male = colors[elementPos].count.male + 1;
                                        }

                                        if (checkins[j].user.gender === 'female') {
                                            colors[elementPos].count.female = colors[elementPos].count.female + 1;
                                        }

                                        if (checkins[j].user.status === 'single') {
                                            colors[elementPos].count.single = colors[elementPos].count.single + 1;
                                        }

                                        if (checkins[j].user.status === 'married') {
                                            colors[elementPos].count.married = colors[elementPos].count.married + 1;
                                        }

                                        if (checkins[j].user.status === 'relationship') {
                                            colors[elementPos].count.relationship = colors[elementPos].count.relationship + 1;
                                        }

                                        if (checkins[j].user.orientation === 'gay') {
                                            colors[elementPos].count.gay = colors[elementPos].count.gay + 1;
                                        }

                                        if (checkins[j].user.orientation === 'straight') {
                                            colors[elementPos].count.straight = colors[elementPos].count.straight + 1;
                                        }

                                        if (checkins[j].user.orientation === 'bi') {
                                            colors[elementPos].count.bi = colors[elementPos].count.bi + 1;
                                        }

                                        if (checkins[j].user.age >= 20 && checkins[j].user.age <= 25) {
                                            colors[elementPos].count.age_20_25 = colors[elementPos].count.age_20_25 + 1;
                                        }

                                        if (checkins[j].user.age >= 25 && checkins[j].user.age <= 30) {
                                            colors[elementPos].count.age_25_30 = colors[elementPos].count.age_25_30 + 1;
                                        }

                                        if (checkins[j].user.age >= 30 && checkins[j].user.age <= 40) {
                                            colors[elementPos].count.age_30_40 = colors[elementPos].count.age_30_40 + 1;
                                        }

                                        if (checkins[j].user.age >= 40) {
                                            colors[elementPos].count.age_40_ = colors[elementPos].count.age_40_ + 1;
                                        }

                                        count2++;
                                        if (count2 === checkins.length) {
                                            //#FF0000 red
                                            //#0000FF blue
                                            var field_array = [];
                                            for (var x = 0; x < colors.length; x++) {
                                                field_array.push(colors[x].count.female);
                                            }
                                            var min = Math.min.apply(null, field_array);
                                            var max = Math.max.apply(null, field_array);
                                            var range = max - min;

                                            for (var x = 0; x < field_array.length; x++) {
                                                var difference = field_array[x] - min;
                                                var percent = difference / range;

                                                var value = 1 - percent;
                                                if (value > .5) {
                                                    var diff = value - .5;
                                                    var per = diff / .5;
                                                    var per2 = .15 * per;
                                                    value = per2 + .85;
                                                    var hue = ((value) * 240);
                                                    colors[x].color = "hsl(" + hue + ",100%,50%)";
                                                } else {
                                                    var per = value / .5;
                                                    var per2 = .1 * per;
                                                    value = per2;
                                                    var hue = ((value) * 120);
                                                    colors[x].color = "hsl(" + hue + ",100%,50%)";
                                                }
                                            }

                                            return res.send(200, colors);
                                        }


//                                    db.users.findOne({_id:mongojs.ObjectId(checkins[j].user.id)}, function(err, user){
//                                        console.log(user.name);
//                                        //console.log(checkins[count2]);
//                                        if(user.gender === 'male'){
//                                            console.log(checkins[count2].bar.neighborhood.id);
//                                            var elementPos = colors.map(function(x) {return JSON.stringify(x._id); }).indexOf(JSON.stringify(checkins[count2].bar.neighborhood.id));
//                                            colors[elementPos].color = "#FF0000"
//                                            console.log(colors[elementPos]);
//                                        }
//                                        count2++;
//                                        if(count2 === checkins.length ){
//                                            return res.send(200, colors);
//                                        }
//                                    });
                                    }
                                });
                            }
                       }
                    });
                }

        });

//        var current = new Date();
//        var range = new Date();
//        range.setHours(current.getHours()-20);
//        //
//        db.checkins.find({datetime: {$gte: range}}, function(err, checkins){
//           for(var i = 0; i < checkins.length; i++){
//                console.log(checkins[i].user);
//           }
//        });
//
//        return res.send(200);



        //

//        db.bars.find({"category._id ": req.query.id}, function(err, bars){
//            console.log(JSON.stringify(bars));
//            return res.send(200);
//        });

//        db.bars.find({"category._id": req.query.id},function(err,bars){
//            console.log(bars[0]);
//        });
    });

    app.post('/service/findBarLocation', function(req,res) {
        if (req.body.add.bar.address) {
            var resObj = {};
            var url = "https://maps.googleapis.com/maps/api/geocode/json?address=";
            if (req.body.add.bar.address.street){
                url = url + req.body.add.bar.address.street;
                if(req.body.add.bar.address.city){
                    url = url + "," + req.body.add.bar.address.city;

                    if(req.body.add.bar.address.state){
                        url = url + "," + req.body.add.bar.address.state;
                    }
                    if(req.body.add.bar.address.zipcode){
                        url = url + "," + req.body.add.bar.address.zipcode;
                    }
                    url = url + "&key=AIzaSyACTRsWl81eJw3AMyDKGHfbWYQkmcdjC2k";
                    console.log(url);

                    request(url, function (error, response, dataString) {
                        if (!error && response.statusCode == 200) {
                           var data = JSON.parse(dataString);
                            if(data.results.length > 0){
                               var result = data.results[0];
                               var addressParts = result.formatted_address.split(',');
                               resObj.street = addressParts[0].trim();
                               resObj.city = addressParts[1].trim();
                               var moreAddressParts = addressParts[2].trim().split(" ");
                               resObj.state = moreAddressParts[0].trim();
                               resObj.zipcode = moreAddressParts[1].trim();
                               resObj.latitude = result.geometry.location.lat;
                               resObj.longitude = result.geometry.location.lng;
                               console.log(resObj);
                                db.neighborhoods.findOne( { geometry :
                                    { $geoIntersects :
                                        { $geometry :
                                            { type : "Point" ,
                                                coordinates : [ resObj.longitude, resObj.latitude ]
                                             } } } },
                                    function(err,dbResult){
                                        if(dbResult) {
                                            resObj.neighborhood = {id: dbResult._id, name: dbResult.name};
                                            res.send(200, resObj);
                                        } else {
                                            res.send(200, resObj);
                                        }
                                } );
                           }

                        }
                    });
                }
            }
        } else {
            res.send(500);
        }
    });

    app.get('/service/resetPassword/:id', jwtauth.auth, function (req, res) {
        console.log('umbrella :: service :: resetPassword - id=' + req.params.id);
        db.users.findOne({_id: mongojs.ObjectId(req.params.id)}, function (err, user) {
            if (err || !user) {
                console.log('No user found');
                return res.send("No user found");
            } else {
                console.log('Found a user');
                if (user.auth && user.auth.local && user.auth.local.password) {
                    var randomPassword = passwordGen.generate(8);
                    //todo: send this password to the user
                    console.log(randomPassword);
                    user.auth.local.password = bcrypt.hashSync(randomPassword, bcrypt.genSaltSync(8), null);
                    db.users.save(user, function (err, user) {
                        if (err) {
                            console.log("Issue updating the user with the new password");
                            return res.send(500, "Error updating user");
                        } else {
                            console.log("Password reset successfully");
                            return res.send(user);
                        }
                    });
                } else {
                    console.log("Account has no password");
                    return res.send("Account has no password");
                }
            }
        });
    });

    app.post('/service/changePassword', jwtauth.auth, function (req, res) {
        console.log('umbrella :: service :: changePassword');
        var currentUser = req.user;
        var password = req.body;
        if (!bcrypt.compareSync(password.old, currentUser.auth.local.password)) {
            console.log("incorrect old password, cant change password");
            return res.json(401, { message: "Incorrect password" });
        } else {
            console.log("old password valid");
            if (password.new === password.re) {
                currentUser.auth.local.password = bcrypt.hashSync(password.new, bcrypt.genSaltSync(8), null);
                db.users.save(currentUser, function (err, user) {
                    if (err) {
                        console.log("issue saving use with new password");
                        return res.send(500, "Error updating user");
                    } else {
                        console.log("saved user with new password");
                        var token = jwt.encode({
                            iss: user._id
                        }, app.get('jwtTokenSecret'));
                        console.log("generating a new token");
                        //todo: token needs to include auth info
                        return res.json(200, { token: token, user: user });
                    }
                });
            }

        }

    });

    /******* UMBRELLA.BAR SERVICES ******/
        //get all bars
    app.get('/service/bars', function (req, res) {
        console.log("umbrella :: service :: getAllBars");
        db.bars.find(function (err, bar) {
            if (err || !bar) {
                console.log('no bar found');
                return res.send("No bar found");
            } else {
                console.log('bars found');
                return res.send(bar);
            }
        });
    });

    //get one bar
    app.get('/service/bars/:id', function (req, res) {
        console.log("umbrella :: service :: getBar id=" + req.params.id);
        db.bars.findOne({_id: mongojs.ObjectId(req.params.id)}, function (err, bar) {
            if (err || !bar) {
                res.send("No bar found");
            } else {
                res.send(bar);
            }
        });
    });

    //add a bar
    app.post('/service/bars', jwtauth.auth, function (req, res) {
        console.log("umbrella :: service :: addBar");
        var barObj = req.body;
        barObj.neighborhood.id = mongojs.ObjectId(barObj.neighborhood.id);
        db.bars.insert(barObj, function (err, bar) {
            if (err) {
                res.send(err);
            } else {
                res.send(bar);
            }
        });
    });

    //delete a bar
    app.delete('/service/bars/:id', jwtauth.auth, function (req, res) {
        console.log("umbrella :: service :: deleteBar id=" + req.params.id);
        db.bars.remove({_id: mongojs.ObjectId(req.params.id)}, function (err, bar) {
            if (err || !bar) {
                res.send("No bar found");
            } else {
                res.send(bar);
            }
        });
    });

    //update a bar
    app.put('/service/bars/:id', jwtauth.auth, function (req, res) {
        console.log("umbrella :: service :: updateBar id=" + req.params.id);
        var item = req.body;
        item._id = mongojs.ObjectId(req.params.id)
        db.bars.save(item, function (err, bar) {
            if (err) {
                res.send(err);
            } else {
                res.send(bar);
            }
        })
    });

    /******* UMBRELLA.CATEGORIES SERVICES ******/
        //get all categories
    app.get('/service/categories', function (req, res) {
        console.log("umbrella :: service :: getAllCategories");
        db.categories.find(function (err, cat) {
            if (err || !cat) {
                res.send("No categories found");
            } else {
                res.send(cat);
            }
        });
    });

    //get one category
    app.get('/service/categories/:id', function (req, res) {
        var neighborhoods = req.query.neighborhoods == 'true';
        console.log("umbrella :: service :: getCategory id=" + req.params.id);
        db.categories.findOne({_id: mongojs.ObjectId(req.params.id)}, function (err, cat) {
            if (err || !cat) {
                res.send("No category found");
            } else {

                if(neighborhoods === true && cat.neighborhoods){
                    var full_cat = cat;
                    var count = 0;
                    for(var i = 0; i < full_cat.neighborhoods.length; i++){

                        db.neighborhoods.findOne({_id:full_cat.neighborhoods[i]},function(err,neighborhood){

                            full_cat.neighborhoods[count] = neighborhood;
                            count = count + 1;
                            if(count === cat.neighborhoods.length){
                                res.send(full_cat);
                            }
                        });
                    }
                } else {
                    res.send(cat);
                }
            }
        });
    });

    //add a category
    app.post('/service/categories', jwtauth.auth, function (req, res) {
        console.log("umbrella :: service :: addCategory");
        db.categories.insert(req.body, function (err, cat) {
            if (err) {
                res.send(err);
            } else {
                res.send(cat);
            }
        });
    });

    //delete a category
    app.delete('/service/categories/:id', jwtauth.auth, function (req, res) {
        console.log("umbrella :: service :: deleteCategory id=" + req.params.id);
        db.categories.remove({_id: mongojs.ObjectId(req.params.id)}, function (err, cat) {
            if (err || !cat) {
                res.send("No category found");
            } else {
                res.send(cat);
            }
        });
    });

    //update a category
    app.put('/service/categories/:id', jwtauth.auth,  function (req, res) {
        console.log("umbrella :: service :: updateCategory id=" + req.params.id);
        var item = req.body;
        item._id = mongojs.ObjectId(req.params.id)
        db.categories.save(item, function (err, cat) {
            if (err) {
                res.send(err);
            } else {
                res.send(cat);
            }
        })
    });

    /******* UMBRELLA.USERS SERVICES ******/
        //get all users
    app.get('/service/users', function (req, res) {
        console.log("umbrella :: service :: getAllUsers");
        db.users.find(function (err, user) {
            if (err || !user) {
                console.log("No user found");
                return res.send("No users found");
            } else {
                console.log('Got users');
                return res.send(user);
            }
        });
    });

    //get one user
    app.get('/service/users/:id', function (req, res) {
        console.log("umbrella :: service :: getUser id=" + req.params.id);
        db.users.findOne({_id: mongojs.ObjectId(req.params.id)}, function (err, user) {
            if (err || !user) {
                console.log("No user found");
                return res.send("No user found");
            } else {
                console.log("Found user");
                return res.send(user);
            }
        });
    });

    //add a user
    app.post('/service/users',jwtauth.auth,  function (req, res) {
        console.log("umbrella :: service :: addUser");
        var userObj = req.body;
        if (userObj.auth && !userObj.testAccount) {
            console.log("adding a user, not a test account and it has an auth object");
            db.users.findOne({ 'auth.email': userObj.auth.email }, function (err, user) {
                if (err) {
                    console.log("createUser error" + err);
                    return res.send(500, "Error creating user");
                }
                if (user) {
                    console.log("createUser email is already taken");
                    return res.send(500, "Email already taken");
                } else {
                    console.log("createUser creating a new user");
                    if (userObj.auth.local && userObj.auth.local.password && userObj.auth.local.repassword) {
                        if(userObj.auth.local.password === userObj.auth.local.repassword) {
                            console.log(" creating a custom password");
                            userObj.auth.local.password = bcrypt.hashSync(userObj.auth.local.password, bcrypt.genSaltSync(8), null);
                            delete userObj.auth.local.repassword;
                        } else {
                            console.log("Passwords must match");
                            return res.send(500, "Passwords must match");
                        }
                    } else {
                        console.log("creating a user");
                        if(!userObj.auth.local){
                            userObj.auth.local = {};
                        }
                        var randomPassword = passwordGen.generate(8);
                        console.log(randomPassword);
                        userObj.auth.local.password = bcrypt.hashSync(randomPassword, bcrypt.genSaltSync(8), null);
                    }
                    db.users.insert(userObj, function (err, user) {
                        if (err) {
                            res.send(500, "Error creating user");
                        } else {
                            res.send(user);
                        }
                    });
                }
            });
        } else if (userObj.testAccount) {
            console.log("creating a test account");
            db.users.insert(userObj, function (err, user) {
                if (err) {
                    res.send(500, "Error creating user");
                } else {
                    res.send(user);
                }
            });
        } else {
            console.log("Cant create user thats not a test account and has not auth object");
            return res.send(500, "Cant create user thats not a test account and has not auth object");
        }
    });

    //delete a user
    app.delete('/service/users/:id', jwtauth.auth, function (req, res) {
        console.log("umbrella :: service :: deleteUser id=" + req.params.id);
        db.users.remove({_id: mongojs.ObjectId(req.params.id)}, function (err, user) {
            if (err || !user) {
                return res.send("No user found");
            } else {
                return res.send(user);
            }
        });
    });

    //update a user
    app.put('/service/users/:id', jwtauth.auth, function (req, res) {
        console.log("umbrella :: service :: updateUser id=" + req.params.id);
        db.users.findOne({_id: mongojs.ObjectId(req.params.id)}, function (err, user) {
            if (!err) {
                console.log("found the user");
                var item = req.body;
                item._id = mongojs.ObjectId(req.params.id)

                if (item.testAccount == false && user.testAccount == true && item.auth.email) {
                    console.log("changing the users test account from true to false");
                    db.users.findOne({ 'auth.email': item.auth.email }, function (err, user) {
                        if (err) {
                            console.log("updateUser error" + err);
                            return res.send(500, "Error finding user");
                        }
                        if (user) {
                            console.log("updateUser email is already taken");
                            return res.send(500, "Email already taken");
                        } else {
                            console.log("updateUser updating from test user to real user");
                            var randomPassword = passwordGen.generate(8);
                            console.log(randomPassword);
                            item.auth.local.password = bcrypt.hashSync(randomPassword, bcrypt.genSaltSync(8), null);

                            db.users.save(item, function (err, user) {
                                if (err) {
                                    res.send(500, "Error updating user");
                                } else {
                                    res.send(user);
                                }
                            });
                        }
                    });
                } else if (item.testAccount == true && user.testAccount == false) {
                    console.log("changing the users test account from false to true");
                    if (item.auth) {
                        delete item.auth;
                    }
                    db.users.save(item, function (err, user) {
                        if (err) {
                            return res.send(500, "Error updating user");
                        } else {
                            return res.send(user);
                        }
                    });

                } else if (item.testAccount == false && user.testAccount == false) {
                    console.log("updating a real account");
                    item.auth.local.password = user.auth.local.password;
                    if (item.auth.email !== user.auth.email) {
                        console.log("changing the email of the user");
                        db.users.findOne({ 'auth.email': item.auth.email }, function (err, user) {
                            if (err) {
                                console.log("updateUser error" + err);
                                return res.send(500, "Error finding user");
                            }
                            if (user) {
                                console.log("updateUser email is already taken");
                                return res.send(500, "Email already taken");
                            } else {
                                console.log("updateUser changing users email");
                                // var randomPassword = passwordGen.generate(8);
                                // console.log(randomPassword);
                                // item.local.password = bcrypt.hashSync(randomPassword, bcrypt.genSaltSync(8), null);
                                db.users.save(item, function (err, user) {
                                    if (err) {
                                        res.send(500, "Error updating user");
                                    } else {
                                        res.send(user);
                                    }
                                });
                            }
                        });
                    } else {
                        console.log("updating another user property");
                        db.users.save(item, function (err, user) {
                            if (err) {
                                res.send(500, "Error updating user");
                            } else {
                                res.send(user);
                            }
                        });
                    }
                } else {
                    console.log("this is a test account");
                    db.users.save(item, function (err, user) {
                        if (err) {
                            res.send(500, "Error updating user");
                        } else {
                            res.send(user);
                        }
                    });
                }
            } else {
                res.send(500, "Couldnt find the user");
            }
        });
    });

    /******* UMBRELLA.CHECKINS SERVICES ******/
        //get all checkins
    app.get('/service/checkins', function (req, res) {
        console.log("umbrella :: service :: getAllCheckins");
        db.checkins.find(function (err, checkin) {
            if (err || !checkin) {
                res.send("No checkin found");
            } else {
                res.send(checkin);
            }
        });
    });

    //get one checkin
    app.get('/service/checkins/:id', function (req, res) {
        console.log("umbrella :: service :: getCheckin id=" + req.params.id);
        db.checkins.findOne({_id: mongojs.ObjectId(req.params.id)}, function (err, checkin) {
            if (err || !checkin) {
                res.send("No checkin found");
            } else {
                res.send(checkin);
            }
        });
    });

    //add a checkin
    app.post('/service/checkins', jwtauth.auth, function (req, res) {
        console.log("umbrella :: service :: addCheckin");
        var nCheckin = req.body;
        nCheckin.datetime = new Date(nCheckin.datetime);
        db.checkins.insert(nCheckin, function (err, checkin) {
            if (err) {
                res.send(err);
            } else {
                res.send(checkin);
            }
        });
    });

    //delete a checkin
    app.delete('/service/checkins/:id', jwtauth.auth, function (req, res) {
        console.log("umbrella :: service :: deleteCheckin id=" + req.params.id);
        db.checkins.remove({_id: mongojs.ObjectId(req.params.id)}, function (err, checkin) {
            if (err || !checkin) {
                res.send("No checkin found");
            } else {
                res.send(checkin);
            }
        });
    });

    //update a checkin
    app.put('/service/checkins/:id', jwtauth.auth, function (req, res) {
        console.log("umbrella :: service :: updateCheckin id=" + req.params.id);
        var item = req.body;
        item._id = mongojs.ObjectId(req.params.id)
        db.categories.save(item, function (err, cat) {
            if (err) {
                res.send(err);
            } else {
                res.send(cat);
            }
        })
    });




    /****************TESTER **************************************/
    app.get('/test', function (req, res) {
//bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        var b = bcrypt.compareSync('JYFAOLus', '$2a$08$K.d4MBq1AR5oUQH7QsLJOOwypcl/SvTwWKKP2u6BDxswMfKXDuKcu');
        res.send(b);
    });

    /***************** APPLICATION INDEX FILES *********************/
    app.get('/', function (req, res) {
        res.sendfile('./app/index.html');
    });
}