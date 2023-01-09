const express = require('express');
const morgan = require('morgan');
const logger = require("./logger");
const mongoose = require("mongoose");
var cookieParser = require('cookie-parser');
const path = require('path')
require("dotenv").config();
const Validator = require('express-validator');
const app = express();

mongoose.connect('mongodb://localhost:27017/helo',
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
 }).then(() => {console.log("DB Connected Successfully...")})
   .catch((e)=>{
     
     console.error('database not connected',e)
 })

// configure ejs engine 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//node local storage store the token
if (typeof localStorage === "undefined" || localStorage === null) {
  const LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

//Routes
const user = require("./routes/users");
const conversation = require("./routes/conversation")

//Middlewares  
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json({limit: '50mb',extended:true}));
app.use(express.urlencoded({limit: '50mb',extended:true}));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(Validator())
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));//static file load just like css,js,img,png etc
app.use('/api',user)
app.use('/api',conversation)

const port = 5000

// socket io 
const server = require('http').createServer(app);
const io = require('socket.io')(server);
require("./socket/socket_io")(io)


app.get("/chat",(req,res)=>{
  res.sendFile(__dirname + '/chat.html');
})

app.get("/checkbox",(req,res)=>{
  res.sendFile(__dirname + '/checkbox.html');
})


app.get("/mychat",(req,res)=>{
  res.render("mychat")
})

app.get("/login",(req,res)=>{
  res.render("login")
})

app.get("/signup",(req,res)=>{
  res.render("register",{err_msg:" "})
})
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

