# Facebook Messenger Chat Bot

Reference official documents (https://developers.facebook.com/docs/messenger-platform/quickstart)

## Installation

```sh
npm install
```
## Download and Install Heroku

Heroku official(https://devcenter.heroku.com/articles/heroku-cli#download-and-install)


ex: (Debian/Ubuntu)
```sh
wget -qO- https://cli-assets.heroku.com/install-ubuntu.sh | sh

```


Login your heroku 

```sh
heroku login
```

## index.js 


```javascript
// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'Shawn_Dev') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
});
```
Shawn_Dev is your verify_token
![](Image 31.png)<br>


create your Procfile and add content in heroku execution
```
web: node index.js

```

### Deploy Code to  Heroku
```sh
In Terminal type:
git status	
git add .	
git commit - -message ‘your message’
heroku create
git push heroku master 

```

1. Go to your Heroku Dashboard
2. Select App then Open it

![image](https://github.com/Shawnfoto/fbChatBot/blob/master/images/Image%2031.png)