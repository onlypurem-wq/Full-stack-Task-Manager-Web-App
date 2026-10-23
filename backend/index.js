require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dns = require("dns");
const userRoute = require("./routes/user.router");
const taskRoute = require("./routes/task.router");
const notificationRoute = require("./routes/notification.router");

dns.setDefaultResultOrder("ipv4first");
dns.setServers(['8.8.8.8', '1.1.1.1']);

const PORT = process.env.PORT || 3000

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", // your frontend's address
  credentials: true
}));
app.use('/auth', userRoute);
app.use('/api', taskRoute)

app.get('/', (req, res) => {
    res.send("Welcome to my server")
})

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('Connected!');
    app.listen(PORT, ()=> {
        console.log(`Server is running on port ${PORT}`);
    })
})
.catch((error) => {
    console.log('Connection Failed');
    console.error(error);
})