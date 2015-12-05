'use strict';

app.controller('CheckinCtrl', ['$scope', 'Checkins', 'Bars', 'Users','$filter', function($scope,Checkins,Bars,Users,$filter){

    $scope.datetime = $filter("date")(new Date(), 'yyyy-MM-ddTHH:mm:ss' );//1996-12-19T16:39:57

    $scope.users = [];
    Users.query(function(users){
        for(var i = 0; i < users.length; i++ ){
            users[i].selected = false;
            $scope.users.push(users[i]);
        }
    });
    $scope.bars = [];
    Bars.query(function(bars){
        for(var i = 0; i < bars.length; i++ ) {
            bars[i].selected = false;
            $scope.bars.push(bars[i]);
        }
    });

    $scope.checkins = Checkins.query();

    $scope.selectedUser = [];
    $scope.userSelected = function(user){
       var i = $scope.users.indexOf(user);
       if($scope.users[i].selected) {
           $scope.selectedUser.push($scope.users[i]);
       } else {
           for(var j = 0; j < $scope.selectedUser.length; j++){
               if($scope.selectedUser[j]._id === $scope.users[i]._id){
                   $scope.selectedUser.splice(j,1);
                   break;
               }
           }
       }
    };

    $scope.selectedBar = null;
    $scope.barSelected = function(bar){
        var i = $scope.bars.indexOf(bar);
        if($scope.bars[i].selected) {
            console.log("checked");
            if( $scope.selectedBar === null){
                $scope.selectedBar = $scope.bars[i];
            } else {
                for (var j = 0; j < $scope.bars.length; j++) {
                    if ($scope.selectedBar._id === $scope.bars[j]._id) {
                        $scope.bars[j].selected = false;
                        break;
                    }
                }
                $scope.selectedBar = $scope.bars[i];
            }
        } else {
            $scope.selectedBar = null;
        }
    };

    $scope.addCheckins = function(){
        //$scope.datetime = new Date($scope.datetime).toISOString();

        for(var i = 0; i < $scope.selectedUser.length; i++){
            var checkin = {
                datetime : $scope.datetime,
                user: {
                    id: $scope.selectedUser[i]._id,
                    name: $scope.selectedUser[i].name
                },
                bar: {
                    id: $scope.selectedBar._id,
                    name: $scope.selectedBar.name,
                    location: $scope.selectedBar.location,
                    neighborhood: $scope.selectedBar.neighborhood
                },
                test: true
            };
            if($scope.selectedUser[i].gender){
                checkin.user.gender = $scope.selectedUser[i].gender;
            }
            if($scope.selectedUser[i].dob){
                checkin.user.age = $filter('dobFilter')($scope.selectedUser[i].dob);
            }
            if($scope.selectedUser[i].status){
                checkin.user.status = $scope.selectedUser[i].status;
            }
            if($scope.selectedUser[i].orientation){
                checkin.user.orientation = $scope.selectedUser[i].orientation;
            }
            console.log(checkin);
            Checkins.save({},checkin, function(){
                $scope.checkins = Checkins.query();
            });
        }

    };
}]);
