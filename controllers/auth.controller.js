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
};

//Register for Backend done let's create for it

//Activation and save to database
exports.activationController = (req,res) => {
  const { token } = req.body;
  if(token){
    //Verify the token is valid or not or expired
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION,
      (err,decoded) => {
        if(err){
          return res.status(401).json({
            error : "Expired Token. Signup again"
          })
        } else {
          //If valid save to database
          //Get name email password from token
          const { name, email, password } = jwt.decode(token);

          const user = new User({
            name,
            email,
            password
          });

          user.save((err, user) => {
            if (err) {
              return res.status(401).json({
                error: errorHandler(err)
              });
            } else {
              return res.json({
                success: true,
                message: "Signup success",
                user
              });
            }
          });
        }
      }
    );
  }else{
    return res.json({
      message: "Error happening please try again"
    })
  }
};

exports.loginController = (req,res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  //Validation to req.body we will create custom validation in seconds
  if (!errors.isEmpty()){
    const firstError = errors.array().map(error => error.msg)[0]
    return res.status(422).json({
      error : firstError
    });
  }else{
    //Check if user exist
    User.findOne({
      email
    }).exec((err,user) => {
      if(err || !user){
        return res.status(400).json({
          error : "User with that email does not exist, Please Sign Up"
        });
      }

      //Authentication
      if(!user.authenticate(password)){
        return res.status(400).json({
          error : "Email and password do not match"
        });
      }

      //Generate Token
      const token = jwt.sign(
        {
          _id : user._id
        },process.env.JWT_SECRET,
        {
          expiresIn : "7d" //Token valid in 7 days you can set remember me in front and set it for 30d
        }
      );
      const { _id, name, email, role } = user;
      return res.json({ token, user : { _id, name, email, role }});
    });
  }
};

exports.forgetController = (req, res) => {
  const { email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } else {
    User.findOne(
      {
        email
      },
      (err, user) => {
        if (err || !user) {
          return res.status(400).json({
            error: 'User with that email does not exist'
          });
        }

        const token = jwt.sign(
          {
            _id: user._id
          },
          process.env.JWT_RESET_PASSWORD,
          {
            expiresIn: '10m'
          }
        );

        const emailData = {
          from: process.env.EMAIL_FROM,
          to: email,
          subject: `Password Reset link`,
          html: `
                    <h1>Please use the following link to reset your password</h1>
                    <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
                    <hr />
                    <p>This email may contain sensetive information</p>
                    <p>${process.env.CLIENT_URL}</p>
                `
        };

        return user.updateOne(
          {
            resetPasswordLink: token
          },
          (err, success) => {
            if (err) {
              console.log('RESET PASSWORD LINK ERROR', err);
              return res.status(400).json({
                error:
                  'Database connection error on user password forgot request'
              });
            } else {
              sgMail
                .send(emailData)
                .then(sent => {
                  // console.log('SIGNUP EMAIL SENT', sent)
                  return res.json({
                    message: `Email has been sent to ${email}. Follow the instruction to activate your account`
                  });
                })
                .catch(err => {
                  // console.log('SIGNUP EMAIL SENT ERROR', err)
                  return res.json({
                    message: err.message
                  });
                });
            }
          }
        );
      }
    );
  }
};

exports.resetController = (req,res) => {
  const { resetPasswordLink, newPassword } = req.body;
  const error = validationResult(req);

  //Validation to req.body we will create custom validation in seconds
  if(!error.isEmpty()){
    const firstError = error.array().map(error => error.msg)[0]
    return res.status(422).json({
      error : firstError
    });
  }else{
    if(resetPasswordLink){
      jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(err,decoded){
        if(err){
          return res.status(400).json({
            error : "Expired Link, try again"
          });
        }

        User.findOne({ resetPasswordLink }, (err,user) => {
          if(err || !user){
            return res.status(400).json({
              error : "Something went wrong, Try later"
            });
          }

          const updateFields = {
            password : newPassword,
            resetPasswordLink : ""
          }

          user = _.extend(user, updateFields);

          user.save((err,result) => {
            if(err){
              return res.status(400).json({
                error : "Error reseting user password"
              });
            }

            res.json({
              message : "Great! Now you can login with new password"
            });
          });
        });
      });
    }
  }
}