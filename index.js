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

const Commands = require('./commands');
const commands = new Commands();

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const PORT= 3000 || process.env.PORT;

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

app.post('/command', async (req, res) => {
    const { text, user_name, channel_id } = req && req.body || {};
    
    if (text) {
        const splitMessage = text.split(' ');
        const command = splitMessage[0];
        let values = [];
        if (splitMessage.length > 1) {
            values = splitMessage.slice(1, splitMessage.length);
        }

        console.log(values);
        
        const options = {};
        let response = `There's nothing to ${command}, ${user_name}`;
        
        if (values.length > 0) {
            switch (command) {
                case 'get': {
                    response = await commands.getAsync(values);
                    break;
                }
                case 'hello': {
                    options.channelId = channel_id;
                    return commands.hello(res, options);
                }
                case 'list': {
                    response = commands.getList(res);
                    console.log(`list response: ${response}`);
                    
                    break;
                }
                case 'set': {
                    response = commands.set(values);
                    break;
                }
            }
        } else if (command === 'hello') {
            options.channelId = channel_id;
            return commands.hello(res, { channelId: channel_id });
        } else if (command === 'list') {
            return commands.getList(req, res);
        }

        return res.send(response);
    } else {
        res.send(`You didn't say anything, @${user_name} 🤷‍♀️`);
    }
});