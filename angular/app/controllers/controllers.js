'use strict';

/* Controllers */

var myappControllers = angular.module('myappControllers', []);

myappControllers.controller('LoginCtrl', ['$scope', '$routeParams', '$location', '$http', '$timeout', '$filter', 'Partage', 'Utils',
 function($scope, $routeParams, $location, $http, $timeout, $filter, Partage, Utils) {
	
    $scope.partage = Partage; // Share data between controllers
    $scope.message = "";
    $scope.errors = []; // errors
    $scope.alert = {text:'', type:''}; // alert 

    // INIT
    $scope.init = function(){
        // CLEAN SESSION 
    	$http.get(serverHost + '/logout', {
         withCredentials: true
         }).success(function(data){
            // do something ?
         }); 
    }

    $scope.init();
    
}]);

myappControllers.controller('MenuCtrl', ['$scope', '$routeParams', '$location', '$timeout', '$filter', 'Partage', 'Utils',
 function($scope, $routeParams, $location, $timeout, $filter, Partage, Utils) {
	
    $scope.partage = Partage; // share data between controllers

    // INIT
    $scope.init = function(){

    }

    $scope.init();

}]);

myappControllers.controller('LobbyCtrl', ['$scope', '$routeParams', '$location', '$timeout', '$filter', 'Partage', 'Utils',
 function($scope, $routeParams, $location, $timeout, $filter, Partage, Utils) {
    
    $scope.partage = Partage; // share data between controllers
    $scope.room = "";

    // INIT
    $scope.init = function(){
        $('#lobbyInput').focus();
    }

    $scope.join = function (){
        if($.trim($scope.room)!= ""){
            Partage.room = $scope.room;
            $location.path('/chat/'+Partage.room);
        }
        else{
            $scope.room = "";
            $('#lobbyInput').focus();     
        }
    }

    $scope.init();


}]);

myappControllers.controller('ChatCtrl', ['$scope', '$routeParams', '$location', '$timeout', '$filter', 'Partage', 'Utils', 'mySocket', 'MessageStorage',
 function($scope, $routeParams, $location, $timeout, $filter, Partage, Utils, mySocket, MessageStorage) {

    $scope.partage = Partage; // share data between controllers
   
    $scope.errors = []; // errors
    $scope.alert = {text:'', type:''}; // alert

    $scope.room = "";

	$scope.message = ""; // chat message
	$scope.messages = []; // chat messages
    $scope.usersList = [];
    $scope.numUsers = 0;
  
    // INIT
    $scope.init = function(){

        // we need the room name in the route
        if($.trim($routeParams.room) == ""){
            $location.path('/lobby');
        }

        // init room from the route
        Partage.room = $routeParams.room;
        $scope.room = $routeParams.room;

        // NEW USER ENTER
        MessageStorage.setId(Partage.room); // set storage id
        $scope.messages = MessageStorage.get(); // chat messages from localStorage
        mySocket.emit('NEW_USER', {id: $scope.partage.id, provider: $scope.partage.provider, username: $scope.partage.username , room: $scope.partage.room, avatar: $scope.partage.avatar});

		// destroy socket when leaving the chat
		$scope.$on('$destroy', function () {
              Partage.room = "";
			  mySocket.disconnect();
		});

        mySocket.on('LOGIN', function(data){
            $scope.numUsers = data.numUsers;
            // scroll bottom if necessary
                if(!Partage.isScrolling){
                    Partage.isScrolling = true;
                    $("html, body").animate(
                    { scrollTop: $(document).height() },
                    1000,
                        function(){
                            Partage.isScrolling = false;
                        }
                    );
                }
            // console.log('LOGIN ' + data.numUsers);
        });

        mySocket.on('NEW_USER', function(data){
            $scope.numUsers = data.numUsers;
            $scope.usersList.push({username: data.username, room: data.room, avatar: data.avatar});
			// console.log('NEW USER ' + data.username + ' ' + data.room + ' ' + data.avatar);
        });

        mySocket.on('USER_LEFT', function(data){
            $scope.numUsers = data.numUsers;
            // console.log('USER LEFT ' + data.username + ' ' + data.room);
        });
		
		mySocket.on('NEW_MESSAGE', function(data){
            // limit to 100 messages (by room) in the localStorage
            if($scope.messages.length == 100){
                 $scope.messages.shift();
            }
            // console.log ('get a new message');
            $scope.messages.push(data);
            // store the messages list in the localStorage (max = 100)
            MessageStorage.put($scope.messages);
			
			// scroll bottom if necessary
			if(!Partage.isScrolling){
				Partage.isScrolling = true;
				$("html, body").animate(
				{ scrollTop: $(document).height() },
				1000,
					function(){
						Partage.isScrolling = false;
					}
				);
			}
			
        });
	
    }
	
    $scope.init();

}]);

myappControllers.controller('MessageCtrl', ['$scope', '$routeParams', '$location', '$timeout', '$filter', 'Partage', 'Utils', 'mySocket',
 function($scope, $routeParams, $location, $timeout, $filter, Partage, Utils, mySocket) {

    $scope.partage = Partage; // Share data between controllers
	$scope.message = ""; // chat message
	
    // INIT
    $scope.init = function(){
		$('#chatInput').focus();
    }
	
	$scope.sendMessage = function (){
		if($.trim($scope.message)!= ""){
			// console.log('send message')
            var mome = new Date().getTime();
			mySocket.emit('NEW_MESSAGE', {message : $scope.message, moment: mome});
			
			// scroll bottom if necessary
			if(!Partage.isScrolling){
				Partage.isScrolling = true;
				$("html, body").animate(
				{ scrollTop: $(document).height() },
				1000,
					function(){
						Partage.isScrolling = false;
					}
				);
			}	
		}
		$scope.message = "";
		$('#chatInput').focus();
	}
	
    $scope.init();

}]);
