'use strict';

app.controller('BarDetailsCtrl', ['$scope', '$location', '$routeParams', 'Bars', 'Categories', function($scope,$location, $routeParams, Bars, Categories){
	$scope.addBar = false;
	$scope.categories = Categories.query();

	if($location.path() == '/database/bars/addBar'){
		$scope.addBar = true;
	}
	if($scope.addBar == false){
		Bars.get({id:$routeParams.id}, function(b){
			$scope.bar= b;
		});
	}
	$scope.deleteBar = function(){
		if($scope.addBar == false){
			Bars.delete({id:$scope.bar._id},function(){
				$location.path("/database/bars");
			})
		} else {
			$location.path("/database/bars");
		}
		
	};

	$scope.submitted = false;
	$scope.submit = function(isValid){
		$scope.submitted = true;
		if(isValid){
			console.log(JSON.stringify($scope.bar));
			if($scope.addBar==false){
				Bars.update({id:$scope.bar._id}, $scope.bar, function(){
					$location.path("/database/bars");
				});
			} else {
				Bars.save({},$scope.bar, function(){
					$location.path("/database/bars");
				});
			}
		}
	};
}]);