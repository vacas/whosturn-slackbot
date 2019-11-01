/*
  TODO: SET UP REDIS TO STORE USER LIST
*/

const request = require('request');

const clientId = process.env.SLACK_CLIENT_ID;
const clientSecret = process.env.SLACK_CLIENT_SECRET;
const authToken = process.env.SLACK_AUTH_TOKEN;

console.log('clientId: ', clientId);
console.log('clientSecret: ', clientSecret);
console.log('authToken: ', authToken);


const hello = (res, { channelId }) => {
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

const auth = (req, res) => {
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

const getList = (req, res) => {
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
      // res.json(`Got it 👍`)
    }
  })
}

module.exports = {
  auth,
  hello,
  getList,
}