var socket = io.connect('http://localhost:8080');;
var user;
$(document).ready(function(){
	// SUBMIT A CHAT MESSAGE
	$('.chatContainer form').on('submit',function(){
		$(".chatContainer").scrollTop($(".chatContainer")[0].scrollHeight); // Scroll down the message box 
		var message = $('#messageBox').val();
		// console.log(message);
		if(message.length == 0){
			return false
		}
		$('#messages').append('<li class="messageRight"><strong>'+user+' : </strong>'+message+'</li>');
		socket.emit('chat message',message,user);
		$('#messageBox').val('');
		return false;
	});
	// WELCOME TO CHAT ROOM 
	socket.on('loginUsername',function(username){
		$('#messages').append('<li><span>Welcome to the Live Account Chatroom <strong>'+username.toUpperCase()+'</strong> You have joined the room !! </span></li>');
		$('.username').val(username);
		user = username;
	});
	// MESSAGE BROADCAST TO ALL USERS
	socket.on('chatMessageBroadcast',function(message,fromUser){
		console.log(" i am here ");
		$('#messages').append('<li class="messageSent"><strong>'+fromUser+' : </strong>'+message+'</li>');
	});
	// CHAT BOX ACTIVE USERS
	socket.on('loginUsernameSent',function(useractive){
		$('#users').empty('userChat');
		for(var i=0;i< useractive.length;i++){
			$('#users').append('<li class="userChat"><div class="green"></div><strong>'+useractive[i]+'</strong></li>');
		}
	});
	





	// MAPS Display
	  $('#location').on('click',function(){
      		getLocation();
      });
	// Socket geolocatoion from server   
	  socket.on('geolocationUser',function(user,latlon){
 			var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="+latlon+"&zoom=14&size=400x300&sensor=false";
	  		$('#messages').append('<li class="locationSent"><strong>'+user+'</strong> <img src='+img_url+' alt="googleMap"></li>');
	 		$(".chatContainer").scrollTop($(".chatContainer")[0].scrollHeight); // Scroll down the message box 
	  });

	function getLocation() {
	    if (navigator.geolocation) {
	        navigator.geolocation.getCurrentPosition(showPosition, showError);
	    } else {
	        x.innerHTML = "Geolocation is not supported by this browser.";
	    }
	}

	function showPosition(position) {
	    var latlon = position.coords.latitude + "," + position.coords.longitude;
	    console.log(latlon);
	   	socket.emit('geolocation',user,latlon)
	   	// document.getElementById("mapholder").innerHTML = "<img src='"+img_url+"'>";
	}

	function showError(error) {
	    switch(error.code) {
	        case error.PERMISSION_DENIED:
	            x.innerHTML = "User denied the request for Geolocation."
	            break;
	        case error.POSITION_UNAVAILABLE:
	            x.innerHTML = "Location information is unavailable."
	            break;
	        case error.TIMEOUT:
	            x.innerHTML = "The request to get user location timed out."
	            break;
	        case error.UNKNOWN_ERROR:
	            x.innerHTML = "An unknown error occurred."
	            break;
	    }
	}

}); 