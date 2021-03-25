const express = require("express");
const router = express.Router();

//Validation
const { validRegister,validLogin,forgotPasswordValidator,resertPasswordValidator } = require("../helpers/valid");

//Load controllers
const {
  registerController,
  activationController,
  loginController,
  forgetController,
  resetController,
  googleController
} = require("../controllers/auth.controller");

router.post("/register", validRegister, registerController);
router.post("/login", validLogin, loginController);
router.post("/activation", activationController);
router.put("/password/forget", forgotPasswordValidator, forgetController);
router.put("/password/reset", resertPasswordValidator, resetController);

//Implements social login google and facebook
router.post("/googlelogin", googleController);

module.exports = router;