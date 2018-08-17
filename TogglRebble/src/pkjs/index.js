var keys = require('message_keys');
var keysInverted = {};

var xhr = new XMLHttpRequest();

var token = "";

function sendAppMessage(dict) {
    Pebble.sendAppMessage(dict, function() {
        console.log('Message sent successfully: ' + JSON.stringify(dict));
    }, function(e) {
        console.log('Message failed: ' + JSON.stringify(e));
    });
}

Pebble.addEventListener("ready",
    function(e) {
        console.log("Hello world! - Sent from your javascript application.");
        for (key in keys) {
            keysInverted[keys[key]] = key;
        }
        sendAppMessage({"JSReady" : 1});
    }
);

// Get AppMessage events
Pebble.addEventListener('appmessage', function(e) {
  // Get the dictionary from the message
  var dict = e.payload;
  console.log('Got message: ' + JSON.stringify(dict));
  if (dict.RequestData) {
      var keyName = keysInverted[dict.RequestData];
      console.log("Key: " + keyName + " requested");
      if (keyName === "ApiToken") {
        getTokenFromUsernameAndPassword("diamondminer81@gmail.com", "testing");
      }
  }
});

xhr.onreadystatechange = function() {
    if (this.readyState == XMLHttpRequest.DONE) {
        if (xhrRequest = "token") {
            var _token = token;
            token = this.responseText === "" ? "" : JSON.parse(this.responseText)["data"]["api_token"];
            console.log(token);
            if (_token != token && token != "") {
                // Build a dictionary.
                var dict = {
                    'ApiToken': token
                };
                
                console.log(JSON.stringify(dict));

                // Send the object
                Pebble.sendAppMessage(dict, function() {
                    console.log('Message sent successfully: ' + JSON.stringify(dict));
                }, function(e) {
                    console.log('Message failed: ' + JSON.stringify(e));
                });
            } else if (token === "") {
                token = _token;
                console.log("User crendtials are incorrect or internet may be down");
            } else {
                console.log("This should be impossible.");
            }
        }
    }
}

function getTokenFromUsernameAndPassword (user, pass) {
    xhrRequest = "token";
    xhr.open("GET", "https://www.toggl.com/api/v8/me", true, user, pass);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}