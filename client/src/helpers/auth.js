import cookie from "js-cookie";

//Set in Cookie
export const setCookie = (key,value) => {
  if(window !== "undefined"){
    cookie.set(key,value,{
      //1 Day
      expires : 1
    });
  }
};

//Remove from Cookie
export const removeCookie = key => {
  if(window !== "undefined"){
    cookie.remove(key,{
      expires : 1
    });
  }
};

//Get from cookie like token
export const getCookie = key => {
  if(window !== "undefined"){
    return cookie.get(key);
  }
};

//Set in LocalStorage
export const setLocalStorage = (key,value) => {
  if(window !== "undefined"){
    localStorage.setItem(key, JSON.stringify(value));
  }
};

//Remove from LocalStorage
export const removeLocalStorage = key => {
  if (window !== "undefined"){
    localStorage.removeItem(key);
  }
};

//Auth user after login
export const authenticate = (response,next) => {
  setCookie("token",response.data.token);
  setLocalStorage("user",response.data.user);
  next();
};

//Signout
export const signout = next => {
  removeCookie("token");
  removeLocalStorage("user");
}

//Get user info from LocalStorage
export const isAuth = () => {
  if(window !== "undefined"){
    const cookieChecked = getCookie("token");
    if(cookieChecked){
      if(localStorage.getItem("user")){
        return JSON.parse(localStorage.getItem("user"));
      }else{
        return false;
      }
    }
  }
};

//Update user data in LocalStorage
export const updateUser = (response,next) => {
  if(window !== "undefined"){
    let auth = JSON.parse(localStorage.getItem("user"));
    auth = response.data;
    localStorage.setItem("user",JSON.stringify(auth));
  }
  next();
}