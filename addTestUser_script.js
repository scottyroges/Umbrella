print('starting script');

//{ "_id" : ObjectId("544080b0dffd336d7ef37c13"), "testAccount" : true, "name" : "F_22_S_S", "gender" : "female", "dob" : { "month" : 1, "day" : 1, "year" : 1992 }, "status" : "single" }


for(var i = 0; i < 250; i++){
	var age = Math.floor(Math.random() * 11) + 20;
	var year = 2014 - age;

	var status_no = Math.random();
	var status = "S";
	var status_name = "single";
	if(status_no <= .6){
		status = "S";
		status_name = "single";
	} else if( status_no > .6 && status_no <= .9){
		status = "R";
		status_name = "relationship";
	} else if ( status_no <= 1){
		status = "M";
		status_name = "married";
	}

	//var orientation_no = Math.floor(Math.random() * 3) + 1;
	var orientation = "S";
	var orientation_name = "straight";

	var name = "M_"+age+"_"+status+"_S";
	//print(name);
	
	var new_user = {
		testAccount : true,
		name : name,
		gender: "male",
		dob : {
			month: 1,
			day: 1,
			year: year
		},
		status: status_name
	};
	print(JSON.stringify(new_user));
	db.users.insert(new_user);


}
// var new_user = {
// 	testAccount : true,
// 	name: "F"
// };
print('ending script');