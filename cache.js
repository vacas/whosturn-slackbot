const redis = require('redis'),
      client = redis.createClient(process.env.REDIS_URL);

const {promisify} = require('util');
const getAsync = promisify(client.get).bind(client);

const DEFAULTS = [
  {
    field: 'random',
    value: false,
  },
  {
    field: 'currentList',
    value: [],
  },
  {
    field: 'currentUser',
    value: '',
  },
  {
    field: 'nextUser',
    value: '',
  },
  {
    field: 'blacklist',
    value: [],
  },
  // {
  //   field: 'whitelist',
  //   value: [],
  // },
];

client.on('connect', function() {
    console.log('Redis client connected');
});

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});
    

module.exports = class Cache {
  constructor() {
    // setting DEFAULT in cache if no cached options
    for (let i = 0; i < DEFAULTS.length; i++) {
      const option = DEFAULTS[i];
      const cachedOption = this.getAsync(option.field);
      if (!cachedOption) {
        this.set(option.field, option.value);
      }
    }
  }

  get(key, callback) {
    return client.get(key, callback);
  }

  getAsync(key) {
    return getAsync(key);
  }

  set(key, value) {
    return client.set(key, value, redis.print);
  }

  reset() {
    for (let i = 0; i < DEFAULTS.length; i++) {
      const option = DEFAULTS[i];
      this.set(option.field, option.value);
    }

    return;
  }
}