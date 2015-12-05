'use strict';

app.controller('CategoryDetailsCtrl', ['$scope', '$location', '$routeParams', 'Categories', function($scope,$location, $routeParams, Categories){
	$scope.addCategory = false;
	if($location.path() == '/database/categories/addCategory'){
		$scope.addCategory = true;
	}
	if($scope.addCategory == false){
		Categories.get({id:$routeParams.id}, function(c){
			$scope.category= c;
		});
	}
	$scope.deleteCategory = function(){
		if($scope.addCategory == false){
			Categories.delete({id:$scope.category._id},function(){
				$location.path("/database/categories");
			})
		} else {
			$location.path("/database/categories");
		}
		
	};

	$scope.submitted = false;
	$scope.submit = function(isValid){
		$scope.submitted = true;
		if(isValid){
			console.log(JSON.stringify($scope.category));
			if($scope.addCategory==false){
				Categories.update({id:$scope.category._id}, $scope.category, function(){
					$location.path("/database/categories");
				});
			} else {
				Categories.save({},$scope.category, function(){
					$location.path("/database/categories");
				});
			}
		}
	};
}]);