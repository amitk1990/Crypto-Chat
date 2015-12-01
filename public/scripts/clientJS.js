var socket = io.connect('http://localhost:8080');;
var user;
$(document).ready(function(){

	$('.chatContainer form').on('submit',function(){
		console.log("Hello World");
		var message = $('#messageBox').val();
		console.log(message);
		if(message.length == 0){
			return false
		}
		$('#messages').append('<li class="messageRight"><strong>'+user+' : </strong>'+message+'</li>');
		socket.emit('chat message',message,user);
		$('#messageBox').val('');
		return false;
	});

	socket.on('loginUsername',function(username){
		$('#messages').append('<li><span>Welcome to the Live Account Chatroom <strong>'+username.toUpperCase()+'</strong> You have joined the room !! </span></li>');
		$('.username').val(username);
		user = username;
	});

	socket.on('chatMessageBroadcast',function(message,fromUser){
		$('#messages').append('<li class="messageSent"><strong>'+fromUser+' : </strong>'+message+'</li>');
	});
});

