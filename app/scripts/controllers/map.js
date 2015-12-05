'use strict';

app.controller('MapCtrl', ['$scope', 'Bars', 'Checkins', '$http', function ($scope, Bars, Checkins, $http) {

//    $scope.bars = Bars.query(function(){
//        $scope.model = [];
//        for(var i = 0; i < $scope.bars.length; i++){
//            if($scope.bars[i].location) {
//                var tmp = {};
//                tmp = $scope.bars[i].location;
//                tmp.id = i;
//                console.log(tmp);
//                $scope.model.push(tmp);
//                //$scope.model = $scope.bars[i].location;
//            }
//
//        }
//        console.log(JSON.stringify($scope.model));
//    });
    $scope.model = [];
//    $scope.checkins = Checkins.query(function (checkins) {
//        var checkedBar = [];
//        var count = 0;
//        for (var i = 0; i < checkins.length; i++) {
//            if (checkedBar.indexOf(checkins[i].bar.id) < 0) {
//                checkedBar.push(checkins[i].bar.id);
//                var tmp = checkins[i];
//                tmp.mapId = count++;
//                tmp.users = [checkins[i].user];
//                delete tmp.user;
//                //tmp.showWindow = false;
//                console.log(JSON.stringify(tmp));
//                $scope.model.push(tmp);
//            } else {
//                for(var j = 0; j < $scope.model.length; j++){
//                    if($scope.model[j].bar.id === checkins[i].bar.id){
//                        $scope.model[j].users.push(checkins[i].user);
//                        break;
//                    }
//                }
//            }
//        }
//    });
    $scope.query = {};
    $scope.dropdown = {
        gender: ["male","female"],
        status : ["single", "relationship","married"],
        age : [20,21,22,23,24,25,26,27,28,29,30],
        orientation: ["straight", "gay", "bi"]
    };
    $scope.polygons = [];

    $scope.getColors = function() {
        $scope.polygons = [];

        if($scope.query['user.gender'] === null){
            delete $scope.query['user.gender'];
        }
        if($scope.query['user.status'] === null){
            delete $scope.query['user.status'];
        }
        if($scope.query['user.age'] === null){
            delete $scope.query['user.age'];
        }
        console.log($scope.query);
        $http.post('/service/colors?id=53632081d0a9f8fe0bddc719&range=20000', $scope.query).
            success(function (data) {
                var polygon_count = 1;
                for (var j = 0; j < data.length; j++) {
                    var neighborhood = data[j];
                    if (neighborhood.geometry.type === 'MultiPolygon') {
                        for (var x = 0; x < neighborhood.geometry.coordinates.length; x++) {
                            var prepolygon = neighborhood.geometry.coordinates[x];
                            for (var y = 0; y < prepolygon.length; y++) {
                                var polygon = prepolygon[y];
                                var shape = {
                                    id: polygon_count,
                                    stroke: {
                                        color: '#6060FB',
                                        weight: 0
                                    },
                                    editable: false,
                                    draggable: false,
                                    geodesic: false,
                                    visible: true,
                                    fill: {
                                        color: neighborhood.color,
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
                            }
                        }


                    } else {
                        var polygon = neighborhood.geometry.coordinates[0];
                        var shape = {
                            id: polygon_count,
                            stroke: {
                                color: '#6060FB',
                                weight: 0
                            },
                            editable: false,
                            draggable: false,
                            geodesic: false,
                            visible: true,
                            fill: {
                                color: neighborhood.color,
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
                    }
                }
            }).
            error(function (data) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };

    $scope.markersEvents = {
        click: function (gMarker, eventName, model) {
            console.log(gMarker);
            console.log(model);
            $scope.selected = model;
            $scope.$apply();
            //model.showWindow = !model.showWindow;
//            if(model.$id){
//                model = model.coords;//use scope portion then
//            }
//            alert("Model: event:" + eventName + " " + JSON.stringify(model));
        }
    };
    //38.8951° N, 77.0367° W
//    latitude: 40.768,
//        longitude: -73.9597
//    $scope.map = {
//        center: {
//            latitude: 38.8951,
//            longitude: -77.9597
//        },
//        zoom: 12
//    };

    //{ "latitude" : 40.768, "longitude" : -73.9597 }
    $scope.map = {
        center: {
            latitude: 40.768,
            longitude: -73.9597
        },
        zoom: 12
    };



}
])
;