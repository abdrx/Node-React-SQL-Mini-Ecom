import React, { useState } from "react";
import axios from "axios";
import "./Login.scss";
import { getBaseURL } from "../apiConfig";
import TokenRefresher from "../Utils/token"; 

function Login(props) {
  let [uname, setUname] = useState("");
  let [password, setPass] = useState("");
  let [error, setError] = useState("");

  // Adding click handler
  function handleClick() {
    if (validateInputs()) {
      const user = {
        email: uname,
        password: password,
      };
      let url = `${getBaseURL()}api/users/login`;
      axios
        .post(url, { ...user })
        .then((res) => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            console.log("Logged in successfully");
            sessionStorage.setItem("isUserAuthenticated", true);
            const user = res.data[0].isAdmin;
            sessionStorage.setItem("customerId", res.data[0].userId);
            sessionStorage.setItem("isAdmin", user ? true : false);
            sessionStorage.setItem("jwt_token", res.data[0].token);
            sessionStorage.setItem("jwt_refresh_token", res.data[0].refreshToken);
            TokenRefresher(res.data[0].refreshToken);
            props.setUserAuthenticatedStatus(user ? true : false, res.data[0].userId);
          } else {
            setError("Invalid email or password");
          }
        })
        .catch((err) => {
          const msg = err?.response?.data?.error || 'Invalid email or password';
          setError(msg);
        });
    }
  }

  // Function to validate email format
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Function to validate password length
  function validatePassword(password) {
    return password.length >= 6;
  }

  // Function to validate inputs
  function validateInputs() {
    if (!validateEmail(uname)) {
      setError("Please provide a valid email address.");
      return false;
    } else if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    setError("");
    return true;
  }

  // Function to handle changes in email input
  function changeName(event) {
    setUname(event.target.value);
  }

  // Function to handle changes in password input
  function changePass(event) {
    setPass(event.target.value);
  }

  return (
    <>
      <div className="login-container">
        <h1>Login</h1>
        <div>
          <label>E-Mail</label>
          <input type="text" value={uname} onChange={changeName} autoComplete="off" />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={changePass}
            autoComplete="new-password"
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="actions">
          <button className="btn primary" onClick={handleClick}>Login</button>
          <button className="btn secondary" onClick={() => props.navigateToRegisterPage()}>Register</button>
        </div>
      </div>
    </>
  );
}

export default Login;
