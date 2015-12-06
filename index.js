var express 	= require('express'),
	router 		= express.Router(),
	app			= express(),
    server  	= require('http').createServer(app),
    io      	= require('socket.io').listen(server),
    port    	= process.env.PORT || 5000,
    _           = require('underscore'),
    bodyParser  = require('body-parser'),
    util 		= require('util'),
    session 	= require('client-sessions'),
    bcrypt 		= require('bcrypt'),
    multer 		= require('multer'),
    randtoken 	= require('rand-token'),
    moduleIO 	= require('./lib/moduleIO.js');


var username,token=0;
var activeUsers = [];

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
//app.use('/uploads',pictures);

// body parser config
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// support use of session config
app.use(session({
  cookieName: 'session',
  secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
  duration: 2 * 60 * 60 * 1000,	// 2hr session
}));

// serving the main applicaion file (index.html)
// when a client makes a request to the app root
// (http://localhost:8080/)
app.get('/', function (req, res) {
	token = randtoken.generate(26);
	console.log(token);
	res.sendFile(__dirname + '/public/index.html');
});

// creating a new live chat account sign up form  
app.post('/ChatApplication', function (req, res) {
	username = req.body.username;	// username 
	var email = req.body.email;		// email	
	var pwd = req.body.pwd;			// password
	var repwd = req.body.repwd;		// recheck password
	var clientToken = req.body.token;
	console.log("NEW USER CHECK"+username+' '+' '+email+' '+pwd+' '+repwd+' '+token);	
	if(pwd.length == repwd.length && pwd === repwd){
								
		// SALT N PEPPER -- CRYPTO
		var salt = bcrypt.genSaltSync(10);
		var	saltPep = pwd.concat(username);
			console.log(saltPep);
		var pwdHash = bcrypt.hashSync(saltPep, salt);
		// console.log("hash password"+pwdHash);
		userInfo = moduleIO.readFromFile();
		console.dir(userInfo);
		var listOfUsers = moduleIO.getListOfUsers();
		if(!moduleIO.checkUserNameExists(listOfUsers,username)){
				req.session.user = username; // set user with username
				var userDetails = {'username': username, 'pwd':pwdHash};	//  use ModuleIO to store userName and Hash Password into JSON FILE
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
// Enter Chat Application 
app.post('/ValidateUser',function(req,res){
	console.log(req.session.user);
	console.log(req.body.username);
	username = req.body.username;
	var pwd = req.body.password;
	var clientToken = req.body.token;
	console.log(clientToken);
	if(moduleIO.validUserCheck(username,pwd)){
		console.log("REGISTERED USER");
		res.sendFile(__dirname+'/public/chatApp.html');
		req.session.user = username; // set user with username
		console.log("Session Data"+req.session.user);
	}else{
		res.sendFile(__dirname+'/public/index.html');
	}
});

// logout
app.get('/logout',function(req,res){
	req.session.reset();
	res.redirect('/');
});
var path,filename;
app.get('/ValidateUser',function(req,res){	
	if(req.session.user){
		res.sendFile(__dirname+'/public/chatApp.html');
	}else{
		res.redirect('/logout');
	}
	
});


//------------------------- FILE UPLOAD--------------------------
/*				FILE FORMAT JSON	*/
// uploads
// { fieldname: 'image',
//   originalname: 'hello.js',
//   encoding: '7bit',
//   mimetype: 'application/javascript',
//   destination: 'uploads/',
//   filename: 'image-1449343600222',
//   path: 'uploads/image-1449343600222',
//   size: 239 }

//var upload = multer({dest:'uploads/'})

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
 
var upload = multer({ storage: storage })
var cpUpload = upload.single('image')
var filePath;
app.post('/uploads', cpUpload, function(req,res){
	if(req.session.user){
		console.log('uploads');
		console.log(req.file.path);
		console.log(req.file.filename);
		path 	 = req.file.path;
		filename = req.file.filename;
		var response = {
    		status  : 200,
    		success : 'Updated Successfully'
		}
		req.session.fileSend = true;
		filePath =req.file.path;
		console.log(filePath);
		var fileObj = { 'path': filePath , 'filename' : req.file.filename,'username':req.session.user };
  		res.send(fileObj);
	}else{
		res.redirect('/logout');
	}
});

app.get('/uploads/image-*',function(req,res){
	if(req.session.user){
		res.sendFile(__dirname+'/'+filePath);
	}else{
		res.redirect('/logout');
	}
});

//--------------SOCKET IO CHAT APPLICATION -- SERVER -----------------


io.on('connection',function(socket){
	console.log("User is connected");
	if (username !=null) {
		activeUsers.push(username);
	}
	socket.emit('loginUsername',username);
	console.log(_.uniq(activeUsers));
	activeUsers = _.uniq(activeUsers);
	io.emit('loginUsernameSent',activeUsers);
	socket.on('chat message',function(data,user,hashval){
		console.dir(hashval);
		socket.broadcast.emit('chatMessageBroadcast',data,user,hashval);
	});
	// GEOLOCATION OF SOCKET
	socket.on('geolocation',function(user,latlon){
		console.log(latlon);
		io.emit('geolocationUser',user,latlon);
	});
	//FILE SOCKET 
	socket.on('sendFileToAllUsers',function(data){
		socket.broadcast.emit('fileSendAttached',data);
	});
	// SEND TOKEN
	socket.on('sendToken',function(){
		socket.emit('tokenSent',token);
	});
	// DISCONNECT
	socket.on('disconnect', function(){
		activeUsers = _.without(activeUsers,username);
		socket.broadcast.emit('loginUsernameSent',activeUsers);
    	console.log('user disconnected');
  	});
});


