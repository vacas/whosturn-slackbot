/* 
    TODO:
        - Make commands into class
        - Make cache (redis) into class
        - Add persistence to redis
        - Make ngrok into its own docker image
        - Set redis variables:
            - random: bool
            - currentList: Array<User>
            - currentUser: User
            - nextUser: User
            - blacklist: Array<User>
            - whitelist: Array<User>
        - Set commands:
            - list
            - set
            - get
            - reset
            - customize
            - next
            - current
            - addUser
*/

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis'),
      client = redis.createClient(process.env.REDIS_URL);
const { hello, auth, getList } = require('./commands');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const PORT= 3000 || process.env.PORT;

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
    const { text, user_name, channel_id } = req && req.body || {};
    
    if (text) {
        const splitMessage = text.split(' ');
        const command = splitMessage[0];
        const options = {};
        
        if (splitMessage.length > 1) {
            switch (command) {
                case 'get': {
                    if (splitMessage.length > 1) {
                        console.log('hello');
                        
                        const key = splitMessage[1];
                        console.log(key);
                        
                        return client.get(key, function(error, result) {
                            if (error) {
                                res.send(`An error ocurred: ${error}`);
                                throw error;
                            }

                            if (result) {
                                return res.send(`${key} -> ${result}`);
                            }

                            return res.send(`Nothing is set for "${key}" here, bro 🤷‍♀️`)
                        });
                    } else {
                        return res.send(`Not enough arguments, bro 🤷‍♀️`)
                    }
                }
                case 'hello': {
                    options.channelId = channel_id;
                    hello(res, options);
                }
                case 'list': {
                    getList(req, res);
                }
                case 'set': {
                    if (splitMessage.length > 2) {
                        const key = splitMessage[1];
                        const value = splitMessage[2];
                        client.set(key, value, redis.print);
                        return res.send(`Got you, bro: ${key} -> ${value}`);
                    } else {
                        return res.send(`Not enough arguments, bro 🤷‍♀️`)
                    }
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