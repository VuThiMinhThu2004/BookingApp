const mysql = require('mysql');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', /// thay doi password
    database: 'bookingapp' // ghi ten database cua minh vao
  });

db.connect((err)=>{
  if (!err) 
      console.log('Connect successfully');
  else console.log(err);
})

module.exports=db;



// const mysql = require('mysql');

// const db = mysql.createConnection({  //masterConncection
//   host: 'localhost',
//     user: 'replication_user',
//     password: '123456', /// thay doi password
//     database: 'bookingapp' // ghi ten database cua minh vao
// });

// // Kết nối với slave
// const slaveConnection = mysql.createConnection({
//   host: 'localhost',
//     user: 'replication_user',
//     password: '123456', /// thay doi password
//     database: 'bookingapp' // ghi ten database cua minh vao
// });

// // db.query = db.execute;

// db.connect((err)=>{
//   if (!err) 
//       console.log('Connect successfully');
//   else console.log(err);
// })

// slaveConnection.connect((err)=>{
//   if (!err) 
//       console.log('Connect successfully');
//   else console.log(err);
// })

// module.exports = slaveConnection;
// module.exports=db;


// // const poolCluster = mysql.createPoolCluster();

// // const master = {
// //     host: 'localhost',
// //     user: 'replication_user',
// //     password: '12345', /// thay doi password
// //     database: 'bookingapp' // ghi ten database cua minh vao
// //   };

// // const slave = {
// //     host: 'localhost',
// //     user: 'replication_user',
// //     password: '12345', /// thay doi password
// //     database: 'bookingapp' // ghi ten database cua minh vao
// //   };

// //   poolCluster.addMaster('MASTER', master);
// //   poolCluster.add('SLAVE1', slave);

// // master.connect((err)=>{
// //   if (!err) 
// //       console.log('Connect successfully');
// //   else console.log(err);
// // });

// // slave.connect((err)=>{
// //   if (!err) 
// //       console.log('Connect successfully');
// //   else console.log(err);
// // })





// // var state = {
// //   pool: null,
// //   mode: null,
// // }

// // exports.connect = function(mode, done) {
// //   state.pool = mysql.createPoolCluster()

// //     state.pool.add('WRITE', {
// //       host: 'localhost',
// //     user: 'replication_user',
// //     password: '12345', /// thay doi password
// //     database: 'bookingapp' 
// //     })

// //     state.pool.add('READ1', {
// //       host: 'localhost',
// //     user: 'replication_user',
// //     password: '12345', /// thay doi password
// //     database: 'bookingapp' 
// //     })

// //     state.mode = mode
// //   done()
// // }

// // exports.READ = 'read'
// // exports.WRITE = 'write'

// // exports.get = function(type, done) {
// //   var pool = state.pool
// //   if (!pool) return done(new Error('Missing database connection.'))

// //   if (type === exports.WRITE) {
// //     state.pool.getConnection('WRITE', function (err, connection) {
// //       if (err) return done(err)
// //       done(null, connection)
// //     })
// //   } else {
// //     state.pool.getConnection('READ*', function (err, connection) {
// //       if (err) return done(err)
// //       done(null, connection)
// //     })
// //   }
// // }