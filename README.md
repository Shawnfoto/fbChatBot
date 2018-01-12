# Facebook Messenger Chat Bot

Reference official documents (https://developers.facebook.com/docs/messenger-platform/quickstart)

## usage

```
npm install
```
## Download and Install Heroku

Heroku official(https://devcenter.heroku.com/articles/heroku-cli#download-and-install)


ex: (Debian/Ubuntu)
```
wget -qO- https://cli-assets.heroku.com/install-ubuntu.sh | sh

```


Login your heroku 

```
heroku login
```

## index.js 

### Facebook verification

```
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


create your Procfile in heroku execution
```
web: node index.js

```

Deploy Code to  Heroku