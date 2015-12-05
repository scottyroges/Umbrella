'use strict';

app.controller('UsersCtrl',['$scope','Users', '$filter', '$modal',function($scope,Users,$filter,$modal){
    //Users
    $scope.itemsPerPage = 10;
    $scope.currentPage = 1;

    $scope.users = Users.query(function(){

        $scope.filteredUsers = $scope.users;
        //$scope.searchedUsers = $scope.filteredUsers;
        $scope.totalItems = $scope.filteredUsers.length;
        for(var i = 0; i < $scope.filteredUsers.length; i++){
            $scope.filteredUsers[i].show = false;
            if($scope.filteredUsers[i].dob) {
                var input = $scope.filteredUsers[i].dob;
                $scope.users[i].age = $filter('dobFilter')(input);
            }
        }

        $scope.$watch('currentPage + itemsPerPage', evaluateFilter);
    });

    function evaluateFilter(){
        var begin = (($scope.currentPage - 1) * $scope.itemsPerPage),
            end = begin + $scope.itemsPerPage;

        //$scope.pagedUsers = $scope.searchedUsers.slice(begin,end);
        $scope.pagedUsers = $scope.filteredUsers.slice(begin,end);
    }


    $scope.$watch('testAccountFilter+genderFilter+ageFilter+statusFilter+orientationFilter+userQuery', function() {
        $scope.filteredUsers = $filter('filter')($scope.users,$scope.userQuery);
        var filterObj = {
            testAccount : $scope.testAccountFilter,
            gender: $scope.genderFilter,
            age: $scope.ageFilter,
            status: $scope.statusFilter,
            orientation: $scope.orientationFilter
        };
        if(filterObj.testAccount === undefined || filterObj.testAccount === null ){

            delete filterObj.testAccount;
        }
        if(filterObj.gender === undefined || filterObj.gender === null  ){
            delete filterObj.gender;
        }
        if(filterObj.age === undefined || filterObj.age === null ){
            delete filterObj.age;
        }
        if(filterObj.status === undefined || filterObj.status === null){
            delete filterObj.status;
        }
        if(filterObj.orientation === undefined || filterObj.orientation === null){
            delete filterObj.orientation;
        }

        if(filterObj.gender){
            $scope.filteredUsers = $filter('filter')($scope.filteredUsers, filterObj, function(actual,expected){
                return actual===expected;
            });
        } else {
            console.log(filterObj);
            $scope.filteredUsers = $filter('filter')($scope.filteredUsers, filterObj);
        }
        $scope.totalItems = $scope.filteredUsers.length;
        evaluateFilter();
    });

    $scope.userEditShow = false;
    $scope.userInfoShow = false;
    $scope.userDetailsShow = false;
    $scope.userAddShow = false;
    $scope.userListShow = true;


    $scope.userDelete = function(user){
        var pos = $scope.users.indexOf(user);
        var modalInstance = $modal.open({
            templateUrl: 'views/deleteModal.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
                item: function () {
                    return user;
                }
            }
        });

        modalInstance.result.then(function (doDelete) {
            if(doDelete){
                Users.delete({id:$scope.users[pos]._id},function(){
                    $scope.refreshUsers();
                    $scope.userList();
                })
            }
        }, function () {

        });
    }

    $scope.userInfo = function(user){
        $scope.userEditShow = false;
        $scope.userInfoShow = true;
        $scope.userDetailsShow = false;
        $scope.userAddShow = false;
        $scope.userListShow = false;
    }

    $scope.details = {};
    $scope.userDetails = function(user){
        $scope.userEditShow = false;
        $scope.userInfoShow = false;
        $scope.userDetailsShow = true;
        $scope.userAddShow = false;
        $scope.userListShow = false;

        var pos = $scope.users.indexOf(user);
        $scope.details.user = $scope.users[pos];
    }

    $scope.userList = function(){
        $scope.userEditShow = false;
        $scope.userInfoShow = false;
        $scope.userDetailsShow = false;
        $scope.userAddShow = false;
        $scope.userListShow = true;
    }

    $scope.userAdd = function(){
        $scope.userEditShow = false;
        $scope.userInfoShow = false;
        $scope.userDetailsShow = false;
        $scope.userAddShow = true;
        $scope.userListShow = false;

        $scope.add = {user :{}};
        $scope.addSubmitted = false;
    }

    $scope.addSubmitted = false;
    $scope.userAddSave = function(isValid){

        $scope.addSubmitted = true;
        if(isValid){
            Users.save({},$scope.add.user, function(user){
                $scope.refreshUsers();
                $scope.userList();

            }, function(err){
                console.log("User creation failed");
            });
        }
    }

    $scope.userEdit = function(user){
        $scope.userEditShow = true;
        $scope.userInfoShow = false;
        $scope.userDetailsShow = false;
        $scope.userAddShow = false;
        $scope.userListShow = false;

        $scope.editSubmitted = false;
    }

    $scope.editSubmitted = false;
    $scope.userEditSave = function(isValid){
        $scope.editSubmitted = true;

        if(isValid){
            Users.update({},$scope.add.user, function(user){
                $scope.refreshUsers();
                $scope.userList();

            }, function(err){
                console.log("User creation failed");
            });
        }
    }

    $scope.refreshUsers = function(){
        $scope.users = Users.query(function() {
            $scope.filteredUsers = $scope.users;
            $scope.totalItems = $scope.filteredUsers.length;
            for (var i = 0; i < $scope.filteredUsers.length; i++) {
                $scope.filteredUsers[i].show = false;
                if ($scope.filteredUsers[i].dob) {
                    var input = $scope.filteredUsers[i].dob;
                    $scope.users[i].age = $filter('dobFilter')(input);
                }
            }
            $scope.userQuery = "";
            evaluateFilter();
        });
    }

    $scope.userResetFilters = function(){
        $scope.userQuery = "";
        $scope.testAccountFilter = null;
        $scope.genderFilter = null;
        $scope.ageFilter = null;
        $scope.statusFilter = null;
        $scope.orientationFilter = null;

    }


}]);
