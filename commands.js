/*
  TODO: SET UP REDIS TO STORE USER LIST
*/

const request = require('request');
const Redis = require('./cache');
const Cache = new Redis();

const clientId = process.env.SLACK_CLIENT_ID;
const clientSecret = process.env.SLACK_CLIENT_SECRET;
const authToken = process.env.SLACK_AUTH_TOKEN;

console.log('clientId: ', clientId);
console.log('clientSecret: ', clientSecret);
console.log('authToken: ', authToken);

module.exports = class Commands {
  /*
    Create a user check and extract if they don't
    Add instructions
  */

  hello(res, { channelId }){
    var data = {
        form: {
            token: authToken,
            channel: channelId,
            text: "Hi! :wave: \n I'm your new bot."
        }
    };
    request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
      console.log(error);
      console.log(body);
      
      // Sends welcome message
      res.json();
    });
  }
  
  auth(req, res) {
    request({
        url: 'https://slack.com/api/oauth.access',
        qs: {
            code: req.query.code,
            client_id: clientId,
            client_secret: clientSecret
        },
        method: 'GET',
    }, (error, _, body) => {
        if (error) {
            console.log(error);
        } else {
            res.json(body);
        }
    });
  }
  
  getList(req, res) {
    request({
      url: 'https://slack.com/api/users.list',
      qs: {
        token: authToken
      },
      method: 'GET',
    }, (err, _, body) => {
      const { members } = JSON.parse(body);
      
      if (err) {
        console.log(err);
      } else {
        const filteredMembers = members.filter(member => member.real_name);
        for (let i = 0; i < filteredMembers.length; i++) {
          const member = filteredMembers[i];
          console.log(!member.real_name);
        }
        const memberList = filteredMembers.map(member => member.real_name);
        console.log(memberList);
        
        res.json(`Got it 👍: ${memberList.join(', ')}`);
      }
    })
  }
  
  get(res, splitMessage) {
    if (splitMessage.length > 1) {
      const key = splitMessage[1];
      console.log(key);
      
      const response = Cache.get(key, function(error, result) {
          if (error) {
              res.send(`An error ocurred: ${error}`);
              throw error;
          }
  
          if (result) {
              return `${key} -> ${result}`;
          }
  
          return `Nothing is set for "${key}" here, bro 🤷‍♀️`;
      });
      console.log(response);
      
      return res.send(response);
    } else {
        return res.send(`Not enough arguments, bro 🤷‍♀️`)
    }
  };

  async getAsync(splitMessage) {
    if (splitMessage.length > 1) {
      
      const key = splitMessage[1];
      
      const response = await Cache.getAsync(key);
      console.log('response (getAsync): ', response);
      
      if (response) {
        return response;
      }

      return `Nothing is set for "${key}" here, bro 🤷‍♀️`;
    } else {
        return `Not enough arguments, bro 🤷‍♀️`;
    }
  };
  
  set(splitMessage) {
    if (splitMessage.length > 2) {
      const key = splitMessage[1];
      const value = splitMessage[2];

      const error = Cache.set(key, value);

      if (error) {
        return `Error: ${error}`;
      }

      return `Got you, bro: ${key} -> ${value}`;
    }

    return `Not enough arguments, bro 🤷‍♀️`;
  }
}