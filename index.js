var express 	= require('express'),
	app			= express(),
    server  	= require('http').createServer(app),
    io      	= require('socket.io').listen(server),
    port    	= 8080,
    bodyParser = require('body-parser');

    // hash object to save clients data,
    // { socketid: { clientid, nickname }, socketid: { ... } }
    chatClients = new Object();

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

// serving the main applicaion file (index.html)
// when a client makes a request to the app root
// (http://localhost:8080/)
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

// creating a new live chat account sign up form  
app.post('/testUser', function (req, res) {
	var username = req.body.username
	var email = req.body.email;
	var pwd = req.body.pwd;
	var repwd = req.body.repwd;
	console.log(username+' '+' '+email+' '+pwd+' '+repwd);
	if(pwd.length == repwd.length && pwd === repwd){
		console.log('password match --> create account');
		res.sendFile(__dirname + '/public/index.html');
	}else{
		res.sendFile(__dirname+'/public/index.html?attempt1=failed')
	}	
});
