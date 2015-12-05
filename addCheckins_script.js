print('starting script'); //Math.floor(Math.random() * 6) + 20

//"_id" : ObjectId("543f4b6c28b02c8f517aefea"),
	// "datetime" : ISODate("2014-10-16T00:36:53Z"),
	// "user" : {
	// 	"id" : "540d2b89e160740000e5506e",
	// 	"name" : "test1",
	// 	"gender" : "male",
	// 	"age" : 6,
	// 	"status" : "single"
	// },
	// "bar" : {
	// 	"id" : "540b83d6c0266b9b11d59f5f",
	// 	"name" : "LA TERANGA INC",
	// 	"location" : {
	// 		"latitude" : 40.81714,
	// 		"longitude" : -73.94031
	// 	},
	// 	"neighborhood" : {
	// 		"id" : "543ad549aca436cc6d50727f",
	// 		"name" : "Harlem"
	// 	}
	// },
	// "test" : true

var men = db.users.find({testAccount:true, gender:"male"});
var bars = db.bars.find({"category._id":"53632081d0a9f8fe0bddc719"});

for(var i = 0; i < 500; i++){
	var randMan = Math.floor(Math.random() * (men.length()-1));
	var randBar = Math.floor(Math.random() * (bars.length()-1));

	var findBar = true;
	while(findBar) {
		if(bars[randBar].neighborhood){
			findBar = false;
		} else {
			randBar = Math.floor(Math.random() * (bars.length()-1));
		}
	}

	var date = new Date();
	var userid = men[randMan]._id.str;
	var username = men[randMan].name;
	var usergender = men[randMan].gender;
	var userage = 2014 - men[randMan].dob.year;
	var userstatus = men[randMan].status;

	var barid = bars[randBar]._id.str;
	var barname = bars[randBar].name;
	var barlocation = bars[randBar].location;
	var barneighborhoodid = bars[randBar].neighborhood.id.str;
	var barneighborhoodname = bars[randBar].neighborhood.name;

	var checkin = {
		datetime :  date,
		user : {
			id : userid,
			name: username,
			gender : usergender,
			age : userage,
			status : userstatus
		},
		bar : {
			id : barid,
			name : barname,
			location: barlocation,
			neighborhood: {
				id: barneighborhoodid,
				name: barneighborhoodname
			}
		},
		test : true
	};
	
	db.checkins.insert(checkin);
}
print('ending script');