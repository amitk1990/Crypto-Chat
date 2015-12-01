var express 	= require('express'),
	app			= express(),
    server  	= require('http').createServer(app),
    io      	= require('socket.io').listen(server),
    port    	= 8080,
    bodyParser  = require('body-parser'),
    util 		= require('util'),
    session 	= require('client-sessions');
    moduleIO 	= require('./lib/moduleIO.js');


var username;

    // hash object to save clients data,
    // { socketid: { clientid, nickname }, socketid: { ... } }
    chatClients = new Object();
// Creating a new JSON Data structure to store user Info into file
var userInfo = {
    	userData: []
	};
// listening to port...
server.listen(port);

// configure express, since this server is
// also a web server, we need to define the
// paths to the static files
app.use("/styles", express.static(__dirname + '/public/styles'));
app.use("/scripts", express.static(__dirname + '/public/scripts'));
app.use("/images", express.static(__dirname + '/public/images'));
// body parser config
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// support use of session config
app.use(session({
  cookieName: 'session',
  secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

// serving the main applicaion file (index.html)
// when a client makes a request to the app root
// (http://localhost:8080/)
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

// creating a new live chat account sign up form  
app.post('/ChatApplication', function (req, res) {
	username = req.body.username;	// username 
	var email = req.body.email;		// email	
	var pwd = req.body.pwd;			// password
	var repwd = req.body.repwd;		// recheck password
	console.log("NEW USER CHECK"+username+' '+' '+email+' '+pwd+' '+repwd);	
	if(pwd.length == repwd.length && pwd === repwd){
								
								// TODO : Convert password into a HASH Value using SALT
		
		userInfo = moduleIO.readFromFile();
		console.dir(userInfo);
		var listOfUsers = moduleIO.getListOfUsers();
		if(!moduleIO.checkUserNameExists(listOfUsers,username)){
				req.session.user = username; // set user with username
				var userDetails = {'username': username, 'pwd':pwd};	//  use ModuleIO to store userName and Hash Password into JSON FILE
				userInfo.userData.push(userDetails);
				console.dir(userInfo);
				moduleIO.writeToFile(userInfo);
				console.log('password match --> create account');
				res.sendFile(__dirname + '/public/chatApp.html');

		}else{
			res.sendFile(__dirname+'/public/index.html')
				// duplicate User Exists
		}

	}else{
		res.sendFile(__dirname+'/public/index.html')
	}	
});

app.post('/ValidateUser',function(req,res){
	username = req.body.username;
	var pwd = req.body.password;
	if(moduleIO.validUserCheck(username,pwd)){
		console.log("REGISTERED USER");
		res.sendFile(__dirname+'/public/chatApp.html');
		req.session.user = username; // set user with username
	}else{
		res.sendFile(__dirname+'/public/index.html');
	}
});

//--------------SOCKET IO CHAT APPLICATION -- SERVER -----------------
io.on('connection',function(socket){
	console.log("User is connected");
	socket.emit('loginUsername',username);
	socket.on('chat message',function(data,user){
		console.log('message'+data);
		socket.broadcast.emit('chatMessageBroadcast',data,user);
	});

	socket.on('disconnect', function(){
    	console.log('user disconnected');
  	});
});


