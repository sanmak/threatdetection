var myApp = angular.module('myApp', []);
myApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

myApp.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('file', file);
        var promise =  $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data, status){
        	return data;
        })
        .error(function(data,status,headers){
            console.log(data,status,headers);
        });
        return promise; 
    };
}]);
myApp.controller('logController', ['$scope', '$http','fileUpload',
    function($scope, $http,fileUpload) {
		$scope.logResult = {};
		$scope.showGif = true;
		$scope.message = '';
		$scope.uploadFile = function(){
			$scope.showGif = false;
			var file = $scope.myFile;
        	$scope.fileError = "";
        	if(file !== undefined){
        		$scope.message = '';
	        	var uploadUrl = "/upload";
	      		fileUpload.uploadFileToUrl(file, uploadUrl).then(function(response){
	      			if(response.data.error != null){
                        $scope.message = 'Some error occured. Upload again.';
	      			}
	      			else{
	      				$scope.logResult = response.data.res;
	      			}
	      			
	      			$scope.showGif = true;
	      		});
	      	}
	      	else{
	      		$scope.showGif = true;
	      		$scope.message = 'No file selected';
	      	}
	    };
	}
]);