const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");

//Config .env to ./config/config.env
require("dotenv").config({
  path : "./config/config.env"
});
const app = express();

//Config for only development
if(process.env.NODE_ENV === "development"){
  app.use(cors({
    origin : process.env.CLIENT_URL
  }));
  app.use(morgan("dev"));
  //Morgan give information about each request
  //Cors it's allow deal with reat for loclhost at port 3000 without any problem
}

//Load all Routes
const authRouter = require("./routes/auth.route");

//Use routes
app.use("/api/", authRouter);

app.use((req,res,next) => {
  res.status(404).json({
    success : false,
    message : "Page not Founded"
  });
});
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("App listenging on Port " + PORT);
});