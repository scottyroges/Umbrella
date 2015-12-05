'use strict';

app.controller('DatabaseCtrl', ['$scope', '$routeParams', '$location', function($scope, $routeParams, $location){
	$scope.tab = {bars: false, categories: false, users: false};
	switch($routeParams.tab){
		case 'bars' :
			$scope.tab.bars = true;
		break;
		case 'categories':
			$scope.tab.categories = true;
		break;
		case 'users':
			$scope.tab.users = true;
		break;
		default:
			$scope.tab.bars = true;
		break;
	}

	// $scope.selectedBars = function(){
	// 	$location.path('/database/bars');
	// };
	// $scope.selectedCategories = function(){
	// 	$location.path('/database/categories');
	// };
	// $scope.selectedUsers = function(){
	// 	$location.path('/database/users');
	// };
}]);

app.controller('BarsCtrl2', ['$scope', '$location', 'Bars', function($scope, $location, Bars){
	$scope.bars = Bars.query(); 
	$scope.goToAdd = function(){
		$location.path('/database/bars/addBar');
	};
	$scope.goToEdit = function(index){
		$location.path('/database/bars/' + $scope.bars[index]._id);
	}
}]);

app.controller('CategoriesCtrl', ['$scope', '$location', 'Categories', function($scope, $location, Categories){
	$scope.categories = Categories.query(); 
	$scope.goToAdd = function(){
		$location.path('/database/categories/addCategory');
	};
	$scope.goToEdit = function(index){
		$location.path('/database/categories/' + $scope.categories[index]._id);
	}
}]);

app.controller('UsersCtrl2', ['$scope', '$location', 'Users', function($scope, $location, Users){
	$scope.users = Users.query(); 
	$scope.goToAdd = function(){
		$location.path('/database/users/addUser');
	};
	$scope.goToEdit = function(index){
		$location.path('/database/users/' + $scope.users[index]._id);
	}
}]);