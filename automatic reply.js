// API End Point - added by Stefan

app.post("/webhook/", function(req, res) {
    var body = req.body;
    // messaging_events = body.entry[0].messaging; // all messenger
  
    if (body.object === "page") {
      // Iterate over each entry - there may be multiple if batched
      body.entry.forEach(function(entry) {
        // Get the webhook event. entry.messaging is an array, but
        // will only ever contain one event, so we get index 0
  
        var webhook_event = entry.messaging[0];
        console.log(webhook_event);
  
        // Get the sender PSID
        var sender_psid = webhook_event.sender.id;
        console.log("Sender PSID: " + sender_psid);
  
        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
  
        if (webhook_event.message) {
          handleMessage(webhook_event);
        } else if (webhook_event.postback) {
          handlePostback(sender_psid, webhook_event.postback);
        }
      });
  
      // Return a '200 OK' response to all events
      res.status(200).send("EVENT_RECEIVED");
    } else {
      console.log("EVENT_RECEIVED ERROR");
      res.sendStatus(404);
    }
  });

// Sends response messages via the Send API
function callSendAPI(sender_psid, messageText) {

    var response = {
      text: messageText
    };
    
    //-------Automatic reply
    // Construct the message body
    var request_body = {
      messaging_type: "RESPONSE",
      recipient: {
        id: sender_psid
      },
      message: response
    };
    // Send the HTTP request to the Messenger Platform
    request(
      {
        uri: "https://graph.facebook.com/v2.6/me/messages",
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: "POST",
        json: request_body
      },
      (err, res, body) => {
        if (!err) {
          console.log("message sent!");
        } else {
          console.error("Unable to send message:" + err);
        }
      }
    );
    
  }


  // Handles messages events
function handleMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var message = event.message;
  
    var messageText = message.text;
    var messageAttachments = message.attachments;
  
    console.log(
      "Received message for user %d and page %d at %d with message:",
      senderID,
      recipientID
    );
  
    if (messageText) {
      console.log("messageText: ", messageText);
      callSendAPI(senderID, messageText);
    } else if (messageAttachments) {
      console.log("Message with attachment received");
      // sendTextMessage(senderID, "Message with attachment received");v
    }
  }