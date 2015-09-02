angular.module('checkInApp', ['firebase'])

.controller('mainController', function($scope, $firebaseObject, $http, $templateCache) {
	
  $scope.populatenumber = 1;

  var token = "LSKmIxD1cPDLdThePlMeiJaUqTJJzm6MexMLwRWN";
  // get # of real time users
  var listRef = new Firebase("https://pocbeacons.firebaseio.com/presence/");
  
  listRef.authWithCustomToken(token, function(error, authData) {
    if (error) {
      alert("Authentication Failed!", error);
    } else {
      //alert("Authenticated successfully with payload:", authData);
    }
  });
  var userRef = listRef.push();
  
  // Add ourselves to presence list when online.
  var presenceRef = new Firebase("https://pocbeacons.firebaseio.com/.info/connected");
  presenceRef.authWithCustomToken(token, function(error, authData) {
	    if (error) {
	      alert("Authentication Failed!", error);
	    } else {
	      //alert("Authenticated successfully with payload:", authData);
	    }
	  });
  presenceRef.on("value", function(snap) {
    if (snap.val()) {
      userRef.set(true);
      // Remove ourselves when we disconnect.
      userRef.onDisconnect().remove();
    }
  });
  
  listRef.on("value", function(snap) {
    $scope.online = snap.numChildren();
  });
 

  //connect to firebase 
  var refTable = new Firebase("https://pocbeacons.firebaseio.com/table");
  refTable.authWithCustomToken(token, function(error, authData) {
	    if (error) {
	      alert("Authentication Failed!", error);
	    } else {
	      //alert("Authenticated successfully with payload:", authData);
	    }
	  });

  // sync as object 
  var syncObjectTable = $firebaseObject(refTable);

  // three way data binding
  syncObjectTable.$bindTo($scope, 'table');
  
  
  // connect to firebase 
  var ref = new Firebase("https://pocbeacons.firebaseio.com/checkin");
  ref.authWithCustomToken(token, function(error, authData) {
	    if (error) {
	      alert("Authentication Failed!", error);
	    } else {
	      //alert("Authenticated successfully with payload:", authData);
	    }
	  });

  // sync as object 
  var syncObject = $firebaseObject(ref);

  // three way data binding
  syncObject.$bindTo($scope, 'checkin');
  
  $scope.toTitleCase = function (str)
  {
	  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }
  
  $scope.reset = function(){
	  $scope.checkin = [];
	  ref.set($scope.checkin);
  }
    
  // function to set the default data
  $scope.populate = function() {
	  
    $scope.checkin = [];
    ref.set($scope.checkin);
	  
	for (var i = 0; i<$scope.populatenumber; i++){
		$.ajax({
			  url: 'https://randomuser.me/api/',
			  dataType: 'json',
			  success: function(data){
			    //alert(data.results[0].user.name.first);
			    $scope.user = data.results[0].user;
			    
			    var intStatus = Math.floor(Math.random() * 4);
			    var strStatus = 'CheckInRequest';
			    switch(intStatus){
			    	case 0: strStatus = 'CheckInRequest';
			    	break;
			    	case 1: strStatus = 'CheckInSucess';
			    	break;
			    	case 2: strStatus = 'CheckOutRequest';
			    	break;
			    	default: strStatus = 'CheckOutSucess';
			    	break;
			    }
		    
			    // connect to firebase 
			    var refRandom = new Firebase("https://pocbeacons.firebaseio.com/checkin/test_"+$scope.user.registered);
			    refRandom.authWithCustomToken(token, function(error, authData) {
				    if (error) {
				      alert("Authentication Failed!", error);
				    } else {
				      //alert("Authenticated successfully with payload:", authData);
				    }
				  });
			    refRandom.set({
					beaconIdentifier: 'bbd3a22c98594e83',
			        customerName: $scope.toTitleCase($scope.user.name.first)+' '+$scope.toTitleCase($scope.user.name.last),
			        pictureUrl: $scope.user.picture.thumbnail,
			        status: strStatus,
			        table: (Math.floor(Math.random() * 9)+ 1),
			        bill: intStatus >=2 ? (Math.floor(Math.random() * 99)+ 1) : 0,
			        transaction: "test_"+$scope.user.registered
			    	});
			  }
			});
	}

  };
  
  $scope.actCheckIn = function($event, item){
	  $event.preventDefault();
	  
	  var checkInref = new Firebase("https://pocbeacons.firebaseio.com/checkin/"+item.transaction+"/status");
	  
	  if (item.status =="CheckInRequest"){
		  checkInref.set(
				  "CheckInSucess"
			  );
	  }
	  else if (item.status =="CheckOutRequest"){
		  checkInref.set(
				  "CheckOutSucess"
			  );
	  }	  
  };
  
});
