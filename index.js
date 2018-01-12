var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    app = express();

// Process application/json
app.use(bodyParser.json());
// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

app.set('port', (process.env.PORT || 5000));
// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'));
});


// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot');
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'Shawn_Dev') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
});




// API End Point - added by Stefan

app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging; // all messenger

    for (i = 0; i < messaging_events.length; i++) { // each all messenger

        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;

        if (event.message && event.message.text) {
            text = event.message.text;
            if (text === 'hi') {
                sendGenericMessage(sender);
                continue;
            }
            sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200));
        }
        if (event.postback) {
            text = JSON.stringify(event.postback);
            sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token);
            continue;
        }
    }
    res.sendStatus(200);
});

var token = "EAACCbItfmKABAMR9xZBM1P1UMBLgIRfolLHnV9ZB46swhOc0l4X15IYBMzoB5HrCQ9zuAumwTLth3kUtOeh5l0ZCckp7KruCb0vNiLFiAYRQim1DBa3sJ4VuboFHWaXBEndWKXQKuffa9BVC79seeGC6b4qGpXx4CLtfEsZBDpb9TIwymmTG";
// function to echo back messages - added by Stefan

function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    })
}


// Send an test message back as two cards.

function sendGenericMessage(sender) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Ai Chat Bot Communities",
                    "subtitle": "Communities to Follow",
                    "image_url": "http://www.brandknewmag.com/wp-content/uploads/2015/12/3054218-slide-s-2-is-shame-an-overlooked-design-tool.jpg",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.google.com",
                        "title": "Google"
                    }, {
                        "type": "web_url",
                        "url": "https://www.yahoo.com",
                        "title": "YAHOO"
                    },{
                        "type": "web_url",
                        "url": "https://twitter.com",
                        "title": "Twitter"
                    }],
                }, {
                    "title": "Chatbots FAQ",
                    "subtitle": "Aking the Deep Questions",
                    "image_url": "https://tctechcrunch2011.files.wordpress.com/2016/04/facebook-chatbots.png?w=738",
                    "buttons": [{
                        "type": "postback",
                        "title": "What's the benefit?",
                        "payload": "Chatbots make content interactive instead of static",
                    },{
                        "type": "postback",
                        "title": "What can Chatbots do",
                        "payload": "One day Chatbots will control the Internet of Things! You will be able to control your homes temperature with a text",
                    }, {
                        "type": "postback",
                        "title": "The Future",
                        "payload": "Chatbots are fun! One day your BFF might be a Chatbot",
                    }],
                },  {
                    "title": "Learning More",
                    "subtitle": "Aking the Deep Questions",
                    "image_url": "http://www.brandknewmag.com/wp-content/uploads/2015/12/cortana.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "AIML",
                        "payload": "Checkout Artificial Intelligence Mark Up Language. Its easier than you think!",
                    },{
                        "type": "postback",
                        "title": "Machine Learning",
                        "payload": "Use python to teach your maching in 16D space in 15min",
                    }, {
                        "type": "postback",
                        "title": "Communities",
                        "payload": "Online communities & Meetups are the best way to stay ahead of the curve!",
                    }],
                }]  
            } 
        }
    };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    })
}
