const User = require("../models/auth.model");
const expressJwt = require("express-jwt");
const _ = require("lodash");
const { OAuth2Client } = require("google-auth-library");
const fetch = require("node-fetch");
const { validationResult } = require("express-validator")
const jwt = require("jsonwebtoken");
//Custom error handler to get useful error from database errors
const { errorHandler } = require("../helpers/dbErrorHandling");
//I will use for send mail sendgrind you can use nodemailer also
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.MAIL_KEY)

exports.registerController = (req,res) => {
  const { name,email,password } = req.body;
  const errors = validationResult(req);

  //Validation to req.body we will create custom validation in seconds
  if(!errors.isEmpty()){
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      error : firstError
    });
  }else{
    User.findOne({
      email
    }).exec((err,user) => {
      //If user exists
      if(user){
        return res.status(400).json({
          error : "Email is taken"
        })
      }
    });

    const token = jwt.sign(
      {
        name,
        email,
        password
      },
      process.env.JWT_ACCOUNT_ACTIVATION,
      {
        expiresIn : "15m"
      }
    )

    //Email data sending
    const emailData = {
      from : process.env.EMAIL_FROM,
      to : email,
      subject : "Account Activation Link",
      html : `
        <h1>Please use the following to activate your account</h1>
        <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
        <hr />
        <p>This email may containe sensetive information</p>
        <p>${process.env.CLIENT_URL}</p>
      `
    }

    sgMail.send(emailData).then(sent => {
      return res.json({
        message : "Email has been sent to " + email
      });
    }).catch(err => {
      return res.status(400).json({
        error : errorHandler(err)
      })
    })
  }
}

//Register for Backend done let's create for it