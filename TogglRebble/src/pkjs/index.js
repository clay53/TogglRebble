Pebble.addEventListener("ready",
    function(e) {
        console.log("Hello world! - Sent from your javascript application.");

        // Require the keys' numeric values.
        var keys = require('message_keys');

        // Build a dictionary.
        var dict = {
            'AccountToken': "asdgsadg"
        };
        
        console.log(JSON.stringify(dict));

        // Send the object
        Pebble.sendAppMessage(dict, function() {
            console.log('Message sent successfully: ' + JSON.stringify(dict));
        }, function(e) {
            console.log('Message failed: ' + JSON.stringify(e));
        });
    }
);

var xhr = new XMLHttpRequest();
xhr.open("GET", "https://www.toggl.com/api/v8/me", false, "diamondminer81@gmail.com", "testing");
xhr.setRequestHeader("Coontent-Type", "application/json");
xhr.send();

xhr.onreadystatechange = function() {
    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        console.log("huh");
        console.log(this.response);
    }
}