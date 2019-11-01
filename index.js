require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis'),
      client = redis.createClient(process.env.REDIS_URL);
const { hello, auth, getList } = require('./commands');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const PORT=4390;

client.on('connect', function() {
    console.log('Redis client connected');
});

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});

app.listen(PORT, function() {
    console.log("Example app listening on port " + PORT);
})

app.get('/', function (req, res) {
    res.send('Ngrok is Docker! Path hit: ' + req.url);
});

app.get('/redis', function(req, res) {
    client.get('test', function(error, result) {
        if (error) {
            console.log(error);
            throw error;
        }

        console.log(`GET result -> ${result}`);
    })
});

app.post('/redisPost', function(req, res) {
    const { test } = req && req.body || {};

    console.log(req.body);
    console.log(test);

    if (test) {
      client.set('test', test, redis.print);
    }
});

app.get('/oauth', function(req, res) {
    if (!req.query.code) {
        res.status(500);
        res.send({
            "Error": "Looks like we're not getting code."
        });
        console.log("Looks like we're not getting code.");
    } else {
        auth(req, res);
    }
});

const listOfCommands = ['get', 'set', 'list'];

app.post('/command', function(req, res) {
    console.log('hello');
    
    const { text, user_name, channel_id } = req && req.body || {};
    
    if (text) {
        const splitMessage = text.split(' ');
        const command = splitMessage[0];
        const options = {};
        
        if (splitMessage.length > 1) {
            switch (command) {
                case 'get':
                case 'hello': {
                    options.channelId = channel_id;
                    hello(res, options);
                }
                case 'list': {
                    getList(req, res);
                }
            }
        } else if (command === 'hello') {
            console.log('hello there');
            options.channelId = channel_id;
            hello(res, { channelId: channel_id});
        } else if (command === 'list') {
            getList(req, res);
        }
        else {
            res.send(`There's nothing to ${command}, ${user_name}`);
        }
    } else {
        res.send(`You didn't say anything, @${user_name} 🤷‍♀️`);
    }
});