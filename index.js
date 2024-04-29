const express = require("express");
const app = express();
const ejs = require("ejs");
require("dotenv").config();
const http = require("http").Server(app);
const session = require("express-session");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const clientRedis = require("./connect_redis");
const RedisStore = require("connect-redis").default;
const usersRouter = require("./routes/users");
const generalRouter = require("./routes/general");
const bookingRouter = require("./routes/booking");
const adminRouter = require("./routes/admin");
const chatRouter = require("./routes/chatting");
const MongoClient = require("mongodb").MongoClient;

const chatDemo = require("./routes/chatdemo");

const ratingRouter = require("./routes/rating");

const io = require("socket.io")(http);

mongoose
  .connect(process.env.MONGOLOCAL_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// const clientRedis = Redis.createClient(); //default localhost

// clientRedis.on('connect', function(){
//   console.log('Connected to Redis...');
// });

// clientRedis.on('error', (err) =>{
//   console.log('Redis error: ', err);
// });

const oneDay = 1000 * 60 * 60 * 24;
app.use(
  session({
    secret: "thisismysecretkey",
    store: new RedisStore({
      host: "localhost",
      port: 6379,
      client: clientRedis,
    }),
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);

app.use(flash());

app.use(express.static("public"));
app.use(express.static("pages"));
app.set("view engine", "ejs");
app.set("views", "pages");
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json());

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use(bodyParser.json());

app.use(generalRouter);
app.use(usersRouter);
app.use(bookingRouter);
app.use(adminRouter);
app.use(chatRouter);
app.use(ratingRouter);

app.use(chatDemo);

var messagesCollection;

MongoClient.connect(process.env.MONGOLOCAL_URL, function (err, db) {
  if (err) {
    console.error("Error connecting to MongoDB:", err);
    return;
  }
  messagesCollection = db.collection("Messages"); // Gán giá trị cho biến toàn cục
});

// Bạn có thể sử dụng biến messagesCollection ở bất kỳ nơi nào trong phạm vi chương trình
io.on("connection", function (socket) {
  console.log("Socket connected", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected", socket.id);
  });

  socket.on("message", (data) => {

    // messagesCollection.insertOne({ text: data }, function (err, res) {
    //   console.log("inserted");
    // });
    socket.broadcast.emit("chat-message", data);
  });
});

app.get("/get-session", (req, res) => {
  res.send(req.session);
});
app.get("/set-session", (req, res) => {
  req.session.user = {
    username: "Tips Java",
    age: 12,
    email: "commeo123@gmail.com",
  };
  res.send("Set OK");
});

app.get("/create_data_redis", (req, res) => {
  console.log(req.session.userId);
  let userID = 0;
  if (req.session.userId) {
    userID = req.session.userId;
  }
  clientRedis.exists(`myzset${userID}`, (err, result) => {
    if (result) {
      res.send(`myzset${userID} is exists`);
    } else {
      clientRedis.zadd(
        `myzset${userID}`,
        0,
        "1",
        0,
        "2",
        0,
        "3",
        0,
        "4",
        0,
        "5",
        0,
        "6",
        (err, reply) => {
          if (err) {
            console.error("Error incrementing score:", err);
          }
        }
      );
      res.send(`init myzset${userID}`);
    }
  });
});

http.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
