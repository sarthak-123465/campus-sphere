import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import axios from 'axios';

const ForgotPassword = () => {
  const {auth, alert} = useSelector(state => state);
  const initialState = { email: "" };
  const [userData, setUserData] = useState(initialState);
  const { email } = userData;

  const history = useHistory();

  useEffect(() => {
    if (auth.token) history.push("/");
  }, [auth.token, history]);

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const resetPassword = async () => {
      const res = await axios.post(`/api/forgotPassword`, userData);
      // alert(res.msg)

      history.push("/")
    }
    resetPassword()
  };

  return (
    <div className="auth_page">
      <form onSubmit={handleSubmit} className="inner-shadow">
        <h3 className="text-uppercase text-center mb-4 auth-heading ">
          Campus Sphere
        </h3>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            Email address
          </label>
          <div className="outer-shadow hover-in-shadow form-input-wrap">
            <input
              type="email"
              className="form-control "
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
              onChange={handleChangeInput}
              value={email}
              name="email"
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="btn-1 w-100 d-flex outer-shadow hover-in-shadow justify-content-center"
          disabled={email ? false : true}
        >
          Reset Password
        </button>
        

      </form>
      
    </div>
  );
}

export default ForgotPassword;
