'use strict';

app.controller('BarsCtrl', ['$scope','Bars','Categories','$filter','$http','$modal','$log','$location', function($scope,Bars,Categories,$filter,$http,$modal,$log,$location){
    //default map to zoomed out location
    $scope.map = {
        center: {
            latitude: 40,
            longitude: -95
        },
        zoom: 4
    };



    //Categories
    var origPolygon = [];
    $scope.categories = Categories.query(function(){
        $scope.category = $scope.categories[0];
        $scope.categorySelected();
        $scope.map.center.latitude = $scope.category.location.latitude;
        $scope.map.center.longitude = $scope.category.location.longitude;
        $scope.map.zoom = 12;
    });
    var counter = 0;
    $scope.categorySelected = function(){
        $scope.barQuery = "";
        if($scope.category !== ""){
            $http.get('/service/categories/' + $scope.category._id + '?neighborhoods=true').success(function(data){
                $scope.neighborhoods = data.neighborhoods;

                $scope.polygons = [];
                var polygon_count = 0;
                for (var j = 0; j < $scope.neighborhoods.length; j++) {
                    var neighborhood = $scope.neighborhoods[j];
                    if (neighborhood.geometry.type === 'MultiPolygon') {
                        for (var x = 0; x < neighborhood.geometry.coordinates.length; x++) {
                            var prepolygon = neighborhood.geometry.coordinates[x];
                            for (var y = 0; y < prepolygon.length; y++) {
                                var polygon = prepolygon[y];
                                var shape = {
                                    _id:neighborhood._id,
                                    id: polygon_count,
                                    stroke: {
                                        color: '#FFFFFF',
                                        weight: 1
                                    },
                                    editable: false,
                                    draggable: false,
                                    geodesic: false,
                                    visible: true,
                                    fill: {
                                        color: "#000000",
                                        opacity: 0.6
                                    },
                                    path: []
                                };
                                polygon_count = polygon_count + 1;
                                for (var i = 0; i < polygon.length; i++) {
                                    var tmp = {
                                        latitude: polygon[i][1],
                                        longitude: polygon[i][0]
                                    };
                                    shape.path.push(tmp);
                                }
                                $scope.polygons.push(shape);
                                origPolygon.push(shape);
                            }
                        }


                    } else {
                        var polygon = neighborhood.geometry.coordinates[0];
                        var shape = {
                            _id:neighborhood._id,
                            id: polygon_count,
                            stroke: {
                                color: '#FFFFFF',
                                weight: 1
                            },
                            editable: false,
                            draggable: false,
                            geodesic: false,
                            visible: true,
                            fill: {
                                color: "#000000",
                                opacity: 0.6
                            },
                            path: []
                        };
                        polygon_count = polygon_count + 1;
                        for (var i = 0; i < polygon.length; i++) {
                            var tmp = {
                                latitude: polygon[i][1],
                                longitude: polygon[i][0]
                            };
                            shape.path.push(tmp);
                        }
                        $scope.polygons.push(shape);
                        origPolygon.push(shape);
                    }
                }
            });
        }

    }

    //Neighborhood
    $scope.neighborhoodSelected = function(){
        $scope.barQuery = '';

        if($scope.neighborhood !== null) {
            var newPolygons = JSON.parse(JSON.stringify(origPolygon));
            $scope.polygons = [];
            var elePos = newPolygons.map(function (x) {
                return x._id
            }).indexOf($scope.neighborhood._id);

            newPolygons[elePos].fill.color = "#FFFFFF";
            $scope.polygons = newPolygons;
        } else {
            $scope.polygons = [];
            $scope.polygons = JSON.parse(JSON.stringify(origPolygon));
        }

    };


    //todo:see if i can combine these like in user
    $scope.$watch('category', function(){
        if($scope.category && $scope.category !== ""){
            $scope.filteredBars = $filter('filter')($scope.bars,{category : {name : $scope.category.name}});
            $scope.searchedBars = $scope.filteredBars;
            $scope.totalItems = $scope.filteredBars.length;
            evaluateFilter();
        } else {
            $scope.filteredBars = $scope.bars;
            $scope.searchedBars = $scope.filteredBars;
            $scope.totalItems = $scope.filteredBars.length;
            evaluateFilter();
        }
    });

    $scope.$watch('neighborhood', function(){
       if($scope.neighborhood && $scope.neighborhood !== ""){
           $scope.filteredBars = $filter('filter')($scope.bars,{neighborhood : {name : $scope.neighborhood.name}}, function(actual,expected){
           return actual.name === expected.name;});
           $scope.searchedBars = $scope.filteredBars;
           $scope.totalItems = $scope.filteredBars.length;
           evaluateFilter();
       } else {
           $scope.filteredBars = $scope.bars;
           $scope.searchedBars = $scope.filteredBars;
           $scope.totalItems = $scope.filteredBars.length;
           evaluateFilter();
       }
    });

    $scope.itemsPerPage = 10;
    $scope.currentPage = 1;

    //Bars
    $scope.bars = Bars.query(function(){

        $scope.filteredBars = $scope.bars;
        $scope.searchedBars = $scope.filteredBars;
        $scope.totalItems = $scope.filteredBars.length;
        for(var i = 0; i < $scope.filteredBars.length; i++){
            $scope.filteredBars[i].show = false;
        }

        $scope.$watch('currentPage + itemsPerPage', evaluateFilter);
    });

    function evaluateFilter(){
        var begin = (($scope.currentPage - 1) * $scope.itemsPerPage),
            end = begin + $scope.itemsPerPage;

        $scope.pagedBars = $scope.searchedBars.slice(begin,end);
    }

    $scope.$watch('barQuery',function(){
        $scope.searchedBars = $filter('filter')($scope.filteredBars,$scope.barQuery);
        $scope.totalItems = $scope.searchedBars.length;
        evaluateFilter();
    });


    $scope.model = [];
    //show the bar on the map
    $scope.barShow = function(bar){
        var pos = $scope.searchedBars.indexOf(bar);
        $scope.searchedBars[pos].show = !$scope.searchedBars[pos].show;
        $scope.model = [];
        var counter = 0;
        var showing = false;
        for(var i =0; i < $scope.searchedBars.length; i++){
            delete $scope.searchedBars[i].mapId;
            if($scope.searchedBars[i].show === true){
                showing = true;
                var temp = $scope.searchedBars[i];
                temp.mapId = counter;
//                temp.markerClick = function(){
//                    console.log("clicked here");
//                    $scope.barDetails(temp);
//                };
                counter = counter + 1;
                $scope.model.push(temp);

            }
        }
        if(showing === true){
            $scope.mapButtonShow = false;
        }
    };
    $scope.mapButtonShow = true;
    //var mapAllBool = true;
    $scope.mapList = function(){
        $scope.mapButtonShow = false;
        $scope.model = [];
        var counter = 0;
        for(var i = 0; i < $scope.searchedBars.length; i++){
            $scope.searchedBars[i].show = true;

                var temp = $scope.searchedBars[i];
                temp.mapId = counter;
                counter = counter + 1;
//                temp.markerClick = function(e){
//                    console.log(e);
//                    //$scope.barDetails(this);
//                };
                $scope.model.push(temp);

        }
//
//
//        mapAllBool = !mapAllBool;
    };

    $scope.mapClear = function(){
        $scope.mapButtonShow = true;
        $scope.model = [];
        var counter = 0;
        for(var i = 0; i < $scope.searchedBars.length; i++){
            $scope.searchedBars[i].show = false;
            delete $scope.searchedBars[i].mapId;
        }
    }


    $scope.barListShow = true;
    $scope.barAddShow = false;
    $scope.barEditShow = false;
    $scope.barDetailsShow = false;

    $scope.barAdd = function(){
        $scope.barListShow = false;
        $scope.barAddShow = true;
        $scope.add = {
            bar : {}
        };
        $scope.barAddSubmitted = false;
        $scope.barAddNoNeighborhood = true;
        $scope.barAddNoLongitude = true;
        $scope.barAddNoLatitude = true;
    };



    $scope.barList = function(){
        $scope.barListShow = true;
        $scope.barAddShow = false;
        $scope.barEditShow = false;
        $scope.barDetailsShow = false;
        $scope.model = [];
        var counter = 0;
        for(var i = 0; i < $scope.searchedBars.length; i++){
            delete $scope.searchedBars[i].mapId;
            if($scope.searchedBars[i].show === true) {
                var temp = $scope.searchedBars[i];
                temp.mapId = counter;
                counter = counter + 1;
                $scope.model.push(temp);
            }
        }
    }

    $scope.barDetails = function(bar){
        $scope.barListShow = false;
        $scope.barAddShow = false;
        $scope.barEditShow = false;
        $scope.barDetailsShow = true;

        var pos = $scope.bars.indexOf(bar);
        $scope.details = {
            bar : $scope.bars[pos]
        };

        $scope.model = [];
        var temp = {};
        temp.mapId = 0;
        temp.location = $scope.bars[pos].location;
        $scope.model.push(temp);
    }

    $scope.markersEvents = {
        click: function (gMarker, eventName, model) {
            if($scope.barListShow === false){
                $scope.barList();
                $scope.$apply();
            } else {
                $scope.barDetails(model);
                $scope.$apply();
            }
//            $scope.selected = model;
//            $scope.$apply();
            //model.showWindow = !model.showWindow;
//            if(model.$id){
//                model = model.coords;//use scope portion then
//            }
//            alert("Model: event:" + eventName + " " + JSON.stringify(model));
        }
    };

    $scope.barDelete = function(bar){
        var pos = $scope.bars.indexOf(bar);
        var modalInstance = $modal.open({
            templateUrl: 'views/deleteModal.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
                item: function () {
                    return bar;
                }
            }
        });

        modalInstance.result.then(function (doDelete) {
            if(doDelete){
                Bars.delete({id:$scope.bars[pos]._id},function(){
                    $scope.refreshBars();
                    $scope.barList();
                })
            }
        }, function () {

        });
    }

    $scope.barInfo = function(bar){
        var pos = $scope.bars.indexOf(bar);
    }

    $scope.findLocation = function(){
        var url = "/service/findBarLocation";
        var post = {
            add : {
                bar : {
                    address: {
                        street: $scope.add.bar.address.street,
                        city: $scope.add.bar.address.city
                    }
                }
            }
        };
        if($scope.add.bar.address.state){
            post.add.bar.address.state = $scope.add.bar.address.state;
        }
        if($scope.add.bar.address.zipcode){
            post.add.bar.address.zipcode = $scope.add.bar.address.zipcode;
        }
        $http.post(url,post).success(function(data){
            if(data.neighborhood) {
                $scope.add.bar.address.street = data.street;
                $scope.add.bar.address.city = data.city;
                $scope.add.bar.address.state = data.state;
                $scope.add.bar.address.zipcode = data.zipcode;
                $scope.add.bar.neighborhood = data.neighborhood;
                $scope.add.bar.location = {
                    latitude : data.latitude,
                    longitude :data.longitude
                };

                $scope.barAddNoNeighborhood = false;
                $scope.barAddNoLongitude = false;
                $scope.barAddNoLatitude = false;

                $scope.model = [];
                var temp = {};
                temp.mapId = 0;
                temp.location = $scope.add.bar.location;
                $scope.model.push(temp);
            }
        })
    }

    $scope.barAddSubmitted = false;
    $scope.barAddNoNeighborhood = true;
    $scope.barAddNoLongitude = true;
    $scope.barAddNoLatitude = true;
    $scope.barAddSave = function(isValid){
        $scope.barAddSubmitted = true;
        if($scope.add && $scope.add.bar && $scope.add.bar.neighborhood){
            $scope.barAddNoNeighborhood = false;
        } else {
            isValid = false;
        }
        if($scope.add && $scope.add.bar && $scope.add.bar.location && $scope.add.bar.location.latitude  ){
            $scope.barAddNoLatitude = false;
        }else {
            isValid = false;
        }
        if($scope.add && $scope.add.bar && $scope.add.bar.location && $scope.add.bar.location.longitude){
            $scope.barAddNoLongitude = false;
        }else {
            isValid = false;
        }
        if(isValid){
            console.log(JSON.stringify($scope.add.bar));
            var saveBar = $scope.add.bar;
            saveBar.category = $scope.category;
            Bars.save({},$scope.add.bar, function(){
                $scope.refreshBars();
                $scope.barList();
            });
        }
    };

    $scope.barEdit = function(bar){
        var pos = $scope.bars.indexOf(bar);

        $scope.barListShow = false;
        $scope.barEditShow = true;
        $scope.barDetailsShow = false;

        $scope.barEditSubmitted = false;
    };

    $scope.barEditSubmitted = false;
    $scope.barEditSave = function(isValid){
        $scope.barEditSubmitted = true;
        if(isValid){
            console.log($scope.details.bar);
        }
    }

    $scope.refreshBars = function(){
        $scope.bars = Bars.query(function(){
            $scope.filteredBars = $scope.bars;
            $scope.searchedBars = $scope.filteredBars;
            $scope.totalItems = $scope.filteredBars.length;
            for(var i = 0; i < $scope.filteredBars.length; i++){
                $scope.filteredBars[i].show = false;
            }
            $scope.barQuery = "";
            evaluateFilter();
            $scope.model = [];
        });
    }


}]);

app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, item) {

    $scope.name = item.name;


    $scope.ok = function () {
        $modalInstance.close(true);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };
});
