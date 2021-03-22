import React, { useState } from "react";
import axios from "axios";
import { Redirect } from "react-router-dom";
import authSvg from "../assets/auth.svg";
import { ToastContainer, toast } from "react-toastify";
import { authenticate, isAuth } from "../helpers/auth";

const Register = () => {
  return(
    <div>
      Register Page
    </div>
  )
};

export default Register;