var fs = require('fs');
var _ = require('underscore')
var util = require('util')
var jsonfile = require('jsonfile')
var file = './data.json';
module.exports = {
	writeToFile : function(userObj){
		jsonfile.writeFileSync(file, userObj,{spaces : 2});
		console.log("I am done writing to JSON File");
	},
	readFromFile : function(){
		console.log('DATA IN THE DATABASE ')
		return jsonfile.readFileSync(file);
	},
	getListOfUsers : function(){
		var userList = [];
		var listOfUsers = [];
		var userInfo  = jsonfile.readFileSync(file);
		var usersList = userInfo.userData;
		console.log("-------------------------------------------------------------------------")
		console.log('LIST OF USERS ')
		for(var i =0; i< usersList.length;i++){
			userList.push(_.chain(usersList[i]).pick(usersList[i],'username').value());
		}
		for(var i =0; i< userList.length;i++){
			listOfUsers.push(_.values(userList[i]));
		}
		
		return _.flatten(listOfUsers);

	},
	checkUserNameExists : function(listOfUsers,username){	// check if user already exists
		for(var user in listOfUsers){
			if(listOfUsers[user] == username){
				console.log("Duplicate Present");
				return true;
			}
		}
		console.log("Duplicate not Present");
		return false;
	},
	validUserCheck : function(username,userPwd){
		var usersList = [];
		console.log("-------------------------CHECK PASSWORD------------------------------------")
		var userInfo = jsonfile.readFileSync(file);
		usersList = userInfo.userData;
		for(var i=0;i<usersList.length;i++){
			var usrObj = _.chain(usersList[i]).pick(usersList[i],'username').value();
			var pwdObj = _.chain(usersList[i]).pick(usersList[i],'pwd').value();
			if(pwdObj['pwd'] === userPwd && usrObj['username'] === username){
				console.log('match found');
				return true;
			}
		}
		return false;

	},
	sayBye : function(){
		console.log("Hello I am working !!");
	}
};
