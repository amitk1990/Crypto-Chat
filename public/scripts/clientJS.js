var socket = io.connect('http://localhost:8080');
var user;
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
} 
$(window).on('load',function(){
	//Get cookie routine by Shelley Powers 
function get_cookie(Name) {
  var search = Name + "="
  var returnvalue = "";
  if (document.cookie.length > 0) {
    offset = document.cookie.indexOf(search)
    // if cookie exists
    if (offset != -1) { 
      offset += search.length
      // set index of beginning of value
      end = document.cookie.indexOf(";", offset);
      // set index of end of cookie value
      if (end == -1) end = document.cookie.length;
      returnvalue=unescape(document.cookie.substring(offset, end))
      }
   }
  return returnvalue;
 }
 user = get_cookie('name');
 $('#userName').val(user);
 console.log(user);
 socket.emit('sendverifiedUser',$('#userName').val());
});

$(document).ready(function(){
	// SUBMIT A CHAT MESSAGE
	$('.chatContainer form').on('submit',function(){
		$(".chatContainer").scrollTop($(".chatContainer")[0].scrollHeight); // Scroll down the message box 
		var message = $('#messageBox').val();
		// console.log(message);
		if(message.length == 0){
			return false
		}
		// ENCRYPT THE MESSAGE  - AES ALGORITHM 
		var secret = "amitharshini123";
		var encrypted = '' + CryptoJS.AES.encrypt(message, secret);
		console.log(encrypted);
    	//DATA Integrity supported by using Hash - SHA 256
    	var hash = CryptoJS.HmacSHA256(message, "Secret Passphrase");
    		hash = hash.toString();
	    console.log(hash.toString());
	    user = $('#userName').val();
		$('#messages').append('<li class="messageRight"><strong>'+user+' : </strong>'+message+'</li>');
		socket.emit('chat message',encrypted,user,hash);
		$('#messageBox').val('');
		return false;
	});
	// WELCOME TO CHAT ROOM 
	// socket.on('loginUsername',function(username){
	// 	$('#messages').append('<li><span>Welcome to the Live Account Chatroom <strong>'+username.toUpperCase()+'</strong> You have joined the room !! </span></li>');
	// 	$('.username').val(username);
	// 	//user = username;
	// });
	// MESSAGE BROADCAST TO ALL USERS
	socket.on('chatMessageBroadcast',function(recMessage,fromUser,hashRcv){

					// DECRYPT THE MESSAGE  - AES ALGORITHM 
		var secret = "amitharshini123";
		var decrypted   = CryptoJS.AES.decrypt(recMessage, secret);
		var recvMessage = decrypted.toString(CryptoJS.enc.Utf8);
		console.log("decrypted"+decrypted.toString(CryptoJS.enc.Utf8));
		
					// DATA Integrity supported by using Hash - SHA 256
		var hash = CryptoJS.HmacSHA256(recvMessage, "Secret Passphrase");
			hash = hash.toString();
		
		if(hash.length == hashRcv.length && hash === hashRcv){
			console.log(" Secure DATA INTEGRITY ");
			$('#messages').append('<li class="messageSent"><strong>'+fromUser+' : </strong>'+recvMessage+'</li>');	
		}else{
			console.log("error in DATA INTEGRITY");
		}	
		
	});
	// CHAT BOX ACTIVE USERS
	socket.on('loginUsernameSent',function(useractive){
		$('#users').empty('userChat');
		for(var i=0;i< useractive.length;i++){
			$('#users').append('<li class="userChat"><div class="green"></div><strong>'+useractive[i]+'</strong></li>');
		}
	});
	

	// FILE Upload
	$('#uploadFileBtn').on('click',function(){
		$('#fileToUpload').trigger('click');
	});
	document.getElementById("fileToUpload").onchange = function() {
	$('#uploadForm').trigger('submit');
	};

	$(document).on('click','.download',function(e){
		console.log('clicked');
		window.location.pathname = $(this).data('download');
	});

	$('#uploadForm').on('submit',function() {
	 	var formData = new FormData($(this)[0]);
	 	var fileObj = [];
	    $.ajax({
	        url:'uploads',
	        type: 'POST',
	        data: formData,
	        async: false,
	        success: function (data) {
	            //alert(data);
	            console.log(data);
	            fileObj = data;
	            $('#messages').append('<li class="messageSent"><strong>'+fileObj['username']+'</strong><p class="download" data-download="'+fileObj['path']+'">Attachment </p></li>');
	        	socket.emit('sendFileToAllUsers',fileObj);
	        },
	        cache: false,
	        contentType: false,
	        processData: false
	    });
	    return false;
		});
	// SOCKET FILE - RECEIVED
	socket.on('fileSendAttached',function(fileObj){
			            $('#messages').append('<li class="messageSent"><strong>'+fileObj['username']+'</strong><p class="download" data-download="'+fileObj['path']+'">Attachment </p></li>');	
	});

	// MAPS Display
	  $('#location').on('click',function(){
      		getLocation();
      });
	// Socket geolocatoion from server   
	  socket.on('geolocationUser',function(user,latlon){
 			var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="+latlon+"&zoom=14&size=400x300&sensor=false";
	  		$('#messages').append('<li class="locationSent"><strong class="pull-left">'+user+'</strong> <img src='+img_url+' alt="googleMap"></li>');
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