
var jwt = require('jwt-simple');
var mongojs = require('mongojs');
var app, db;

exports.setVariables = function(express_app, db_connect){
	app = express_app;
	db = db_connect;
};

exports.auth = function(req, res, next) {

  	var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
	if(token){
		try {
			var decoded = jwt.decode(token, app.get('jwtTokenSecret'));
			db.users.findOne({_id:mongojs.ObjectId(decoded.iss)}, function(err, user){
				if(err){
					return res.json(500, {message:"Issue getting user from token"});
				}
				if(!user){
					return res.json(500, {message:"No user with that token"});
				} else {
					req.user = user;
					next();
				}
			});
			//next();
		} catch(e){
			res.json(500, {message:"Issue with the token", error: e});
		}
	} else {
		res.json(401, { message : "You need a valid token"});
	}
};
