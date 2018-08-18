var keys = require('message_keys');
var keysInverted = {};

var xhr = new XMLHttpRequest();
xhr.open("GET", "https://google.com")
xhr.setRequestHeader("Content-Type", "application/json");

var token = "";

function sendAppMessage(dict) {
    Pebble.sendAppMessage(dict, function() {
        console.log('Message sent successfully: ' + JSON.stringify(dict));
    }, function(e) {
        console.log('Message failed: ' + JSON.stringify(e));
    });
}

function sendAppMessageDict(key, dict, index) {
    console.log(dict);
    console.log(dict[index]);
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
      } else if (keyName === "RunningTimeEntry") {
          getRunningTimeEntry();
      }
  }
});

xhr.onreadystatechange = function() {
    if (this.readyState == XMLHttpRequest.DONE) {
        if (xhrRequest === "token") {
            var _token = token;
            token = this.responseText === "" || this.responseText === "None" ? "" : JSON.parse(this.responseText)["data"]["api_token"];
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
        } else if (xhrRequest === "runningTimeEntry") {
            var response = JSON.parse(this.responseText);
            console.log(this.responseText);
            if (response["data"] === null) {
                sendAppMessage({
                    "RunningTimeEntry": 0
                });
            } else {
                sendAppMessage({
                    "RunningTimeEntry": 1,
                    "RunningTimeEntry_id": response["data"]["id"],
                    "RunningTimeEntry_guid": response["data"]["guid"],
                    "RunningTimeEntry_wid": response["data"]["wid"],
                    "RunningTimeEntry_pid": response["data"]["pid"],
                    "RunningTimeEntry_billable": response["data"]["billable"].toString(),
                    "RunningTimeEntry_start": response["data"]["start"],
                    "RunningTimeEntry_duration": response["data"]["duration"],
                    "RunningTimeEntry_description": response["data"]["description"],
                    "RunningTimeEntry_duronly": response["data"]["duronly"].toString(),
                    "RunningTimeEntry_at": response["data"]["at"],
                    "RunningTimeEntry_uid": response["data"]["uid"]
                });
            }
        }
    }
}

function getTokenFromUsernameAndPassword(user, pass) {
    xhrRequest = "token";
    xhr.open("GET", "https://www.toggl.com/api/v8/me", true, user, pass);
    xhr.send();
}

function getRunningTimeEntry() {
    xhrRequest = "runningTimeEntry";
    xhr.open("GET", "https://www.toggl.com/api/v8/time_entries/current", true, token, "api_token");
    xhr.send();
}