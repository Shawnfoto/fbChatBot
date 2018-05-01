"use strict";

var express = require("express"),
  bodyParser = require("body-parser"),
  request = require("request"),
  app = express();

var apiaiApp = require("apiai")("yourApiaiToken");

var PAGE_ACCESS_TOKEN = "yourToken";

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Process application/json
app.use(bodyParser.json());

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Index route
app.get("/", function(req, res) {
  res.send("Hello world, I am a chat bot");
});

// for Facebook verification
app.get("/webhook/", function(req, res) {
  /** UPDATE YOUR VERIFY TOKEN **/
  var VERIFY_TOKEN = "your VERIFY_TOKEN";

  // Parse params from the webhook verification request
  var mode = req.query["hub.mode"];
  var token = req.query["hub.verify_token"];
  var challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// API End Point - added by Stefan

app.post("/webhook/", function(req, res) {
  var body = req.body;

  if (body.object === "page") {
    // Iterate over each entry - there may be multiple if batched
    // messaging_events = body.entry[0].messaging; // all messenger
    body.entry.forEach(function(entry) {
      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0

      var webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function

      if (webhook_event.message) {
        handleMessage(webhook_event);
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
  //---------api ai
  let apiai = apiaiApp.textRequest(messageText, {
    sessionId: "your sessionId" // use any arbitrary id
  });

  apiai.on("response", response => {
    // Got a response from api.ai. Let's POST to Facebook Messenger
    let aiText = response.result.fulfillment.speech;
    var request_body = {
      messaging_type: "RESPONSE",
      recipient: {
        id: sender_psid
      },
      message: { text: aiText } //--->aiText
    };
    console.log("****apiai.on***");
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
  });

  apiai.on("error", error => {
    console.log(error);
  });

  apiai.end();

  //-------Automatic reply
  // var response = {
  //   text: messageText
  // };

  // var request_body = {
  //   messaging_type: "RESPONSE",
  //   recipient: {
  //     id: sender_psid
  //   },
  //   message: response
  // };
  // // Send the HTTP request to the Messenger Platform
  // request(
  //   {
  //     uri: "https://graph.facebook.com/v2.6/me/messages",
  //     qs: { access_token: PAGE_ACCESS_TOKEN },
  //     method: "POST",
  //     json: request_body
  //   },
  //   (err, res, body) => {
  //     if (!err) {
  //       console.log("message sent!");
  //     } else {
  //       console.error("Unable to send message:" + err);
  //     }
  //   }
  // );
  //-----------
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
  }
}

var requestAsync = function(url) {
  return new Promise((resolve, reject) => {
    var req = request(url, (err, response, body) => {
      if (err) return reject(err, response, body);
      resolve(JSON.parse(body));
    });
  });
};

app.post("/ai", (req, res) => {
  console.log("*** Webhook for api.ai query ***");

  if (req.body.result.action === "stock") {
    console.log("*** stock ***");
    let stock_number = req.body.result.parameters["stock-number"];
    let restUrl =
      "http://203.67.19.12/XQWEB_UI/JVO2.aspx?&A=46&B=1&C=00331&P=AR" +
      stock_number +
      "&Lang=TW";
    let closeUrl =
      "http://203.67.19.12/XQWEB_UI/GETSTOCKPRICE.aspx?A=" +
      stock_number +
      ".TW&&Lang=TW";

    console.log("number**", stock_number);

    //----
    const urls = [restUrl, closeUrl];

    var getParallel = async function() {
      //transform requests into Promises, await all
      try {
        var data = await Promise.all(urls.map(requestAsync));
      } catch (err) {
        console.error(err);
      }

      console.log("***data: ", data);
      var msg;
      var DataNumber;
      var DataName;
      var mClose;

      //--
      try {
        DataNumber = data[0].rows[0].Row[0];
        DataName = data[0].rows[0].Row[1];
        mClose = data[1].mClose;
        console.log("***DataNumber && DataName && mClose");
        msg =
          "股票代碼: " +
          DataNumber +
          " " +
          "股票名稱: " +
          DataName +
          " " +
          "收盤價: " +
          mClose +
          " ";
      } catch (e) {
        console.log(e);
        console.log("***查無資料");
        msg = "查無資料";
      }
      //--

      return res.json({
        speech: msg,
        displayText: msg,
        source: "stock"
      });
    };

    getParallel();
  }
});
