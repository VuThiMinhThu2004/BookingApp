const Redis = require('ioredis');
//const Redis = require('redis');
const clientRedis = Redis.createClient(); //default localhost

clientRedis.on('connect', function(){
  console.log('Connected to Redis...');
});

clientRedis.on('error', (err) =>{
  console.log('Redis error: ', err);
});

module.exports=clientRedis;
