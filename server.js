
'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
var myMap = new Map();
var clientMap = new Map();

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

wss.on('connection', (ws) => {
  var sendingUserName = false;
  var userName = false;
  console.log('Client connected');
  ws.on('close', () => {
	console.log('Client disconnected');
	if(userName!== false){
	     myMap.delete(userName);
	     var sendingData = 'UPDATETEAM|';
	for(var connectedUsers of myMap.entries()){
	    
	     for(var entry of clientMap.entries()) {
		     if(connectedUsers[0]!==entry[0]){
			  if(myMap.has(entry[0])){
			sendingData += entry[0] + '%on' +'|';
		     }
		     else{
			sendingData += entry[0] + '%off' +'|';
		     }
		     console.log(entry[0]);
		     }		
		
	}
	sendingData = sendingData.slice(0, -1);
	connectedUsers[1].send(sendingData);
	}

	}
		
	});
  ws.on('message',(message)=>{
  if(typeof message === 'string'){
  var msg = message.split('|');
  switch(msg[0]){
     case 'firstMessage':
	
	if(!clientMap.has(msg[1])){
	    ws.send('NOTFOUND');
	    break;
	
	}
	else if(clientMap.get(msg[1]).password!==msg[2]){
	   ws.send('WRONGPASSWORD');
	   break;
	}
	
	console.log(msg[1] +'set');
	var sendingData = 'CONNECTED';
	myMap.set(msg[1],ws);
	userName = msg[1];
	ws.send(sendingData);
	break;
     case 'REGISTER':
	if(!clientMap.has(msg[1])){
	   var tempClient = {userName:' ',password:' ',eMail:' '};
	   userName = msg[1];
	   tempClient.userName = msg[1];
	   tempClient.password = msg[2];
	   tempClient.eMail = msg[3];
	   clientMap.set(msg[1],tempClient);
	   console.log(msg[1] +'registered');
	   var sendingData = 'REGISTERED';
	myMap.set(msg[1],ws);
	ws.send(sendingData);
	}
	else{
	   ws.send('ALREADYEXIST');
	}
	break;
     case 'CONNECTED':
      var sendingData = 'UPDATETEAM|';
      for(var connectedUsers of myMap.entries()){
	    
	     for(var entry of clientMap.entries()) {
		     if(connectedUsers[0]!==entry[0]){
			  if(myMap.has(entry[0])){
			sendingData += entry[0] + '%on' +'|';
		     }
		     else{
			sendingData += entry[0] + '%off' +'|';
		     }
		     console.log(entry[0]);
		     }
	}
	sendingData = sendingData.slice(0, -1);
	if(connectedUsers[0]!== msg[1]){
	connectedUsers[1].send(sendingData);
	}
	}
      sendingData = 'UPDATETEAM|';
      for(var entry of clientMap.entries()) {
		if(entry[0]!= msg[1]){
		     if(myMap.has(entry[0])){
			sendingData += entry[0] + '%on' +'|';
		     }
		     else{
			sendingData += entry[0] + '%off' +'|';
		     }
		     console.log(entry[0]);
		}
		
	}
	sendingData = sendingData.slice(0, -1);
	ws.send(sendingData);
	break;
	case 'STREAMREQUEST':
	if(!myMap.has(msg[2])){
		ws.send('STREAMREQUESTREJECTED');
	}
	else{
	   myMap.get(msg[2]).send('STREAMREQUEST|' + msg[1]);
	   sendingUserName = msg[2];
	}
	break;
	case 'STREAMREQUESTACCEPTED':
	if(!myMap.has(msg[2])){
		ws.send('STREAMREQUESTREJECTED');
	}
	else{
	   myMap.get(msg[2]).send('STREAMREQUESTACCEPTED|' + msg[1]);
	}
	break;
	case 'STREAMREQUESTREJECTED':
	if(!myMap.has(msg[2])){
		ws.send('STREAMREQUESTREJECTED');
	}
	else{
	   myMap.get(msg[2]).send('STREAMREQUESTREJECTED|' + msg[1]);
	}
	break;

     default:
	break;
  }
  console.log(message);
  
}
else{
 if(!myMap.has(sendingUserName)){
		ws.send('STREAMREQUESTREJECTED');
	}
 else{
 myMap.get(sendingUserName).send(message);
}
}});
});
