const redis = require('redis'),
      client = redis.createClient(process.env.REDIS_URL);

const {promisify} = require('util');
const getAsync = promisify(client.get).bind(client);

client.on('connect', function() {
    console.log('Redis client connected');
});

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});
    

module.exports = class Cache {
  get(key, callback) {
    return client.get(key, callback);
  }

  getAsync(key) {
    return getAsync(key);
  }

  set(key, value) {
    return client.set(key, value, redis.print);
  }
}