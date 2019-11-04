/*
  TODO: SET UP REDIS TO STORE USER LIST
*/

var rp = require('request-promise');
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
  
  getList() {
    return rp({
      url: 'https://slack.com/api/users.list',
      qs: {
        token: authToken
      },
      method: 'GET',
    }).then((res) => {
      console.log('res:',  res);
      
      // console.log(`res: ${res.body}`);
      
      const { members } = JSON.parse(res.body);

      if (!members || members.length === 0) {
        return null;
      }
      
      if (res.error) {
        console.log(res.error);
      } else {
        // const filteredMembers = members.filter(member => member.name);
        // for (let i = 0; i < filteredMembers.length; i++) {
        //   const member = filteredMembers[i];
        //   console.log(member);
        // }
        const memberList = members.filter(member => member.name).map(member => member.name);
        console.log(memberList);
        
        return res.json(`Got it 👍: ${memberList.join(', ')}`);
      }
    });
  }
  
  // get(res, splitMessage) {
  //   if (splitMessage.length > 1) {
  //     const key = splitMessage[1];
  //     console.log(key);
      
  //     const response = Cache.get(key, function(error, result) {
  //         if (error) {
  //             res.send(`An error ocurred: ${error}`);
  //             throw error;
  //         }
  
  //         if (result) {
  //             return `${key} -> ${result}`;
  //         }
  
  //         return `Nothing is set for "${key}" here, bro 🤷‍♀️`;
  //     });
  //     console.log(response);
      
  //     return res.send(response);
  //   } else {
  //       return res.send(`Not enough arguments, bro 🤷‍♀️`)
  //   }
  // };

  async getAsync(key) {
    if (key) {
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

  // async getAsync(values) {
  //   if (values.length > 0) {
  //     const key = values[0];
      
  //     const response = await Cache.getAsync(key);
  //     console.log('response (getAsync): ', response);
      
  //     if (response) {
  //       return response;
  //     }

  //     return `Nothing is set for "${key}" here, bro 🤷‍♀️`;
  //   } else {
  //       return `Not enough arguments, bro 🤷‍♀️`;
  //   }
  // };

  set(key, values) {
    if (values || values.length > 0) {
      const error = Cache.set(key, values);

      if (error) {
        return `Error: ${error}`;
      }

      return `Got you, bro: ${key} -> ${value}`;
    }

    return `Not enough arguments, bro 🤷‍♀️`;
  }
  
  // set(values) {
  //   if (values.length > 1) {
  //     const key = values[0];
  //     const value = values[1];

  //     const error = Cache.set(key, value);

  //     if (error) {
  //       return `Error: ${error}`;
  //     }

  //     return `Got you, bro: ${key} -> ${value}`;
  //   }

  //   return `Not enough arguments, bro 🤷‍♀️`;
  // }
}