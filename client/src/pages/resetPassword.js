import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import axios from 'axios';

const ForgotPassword = () => {
  const {auth, alert} = useSelector(state => state);
  const initialState = { password: "", cf_password: "" };
  const [userData, setUserData] = useState(initialState);
  const { password, cf_password } = userData;

  const [typePass, setTypePass] = useState(false);
  const [typeCfPass, setTypeCfPass] = useState(false);

  const { token } = useParams();
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
    const setPassword = async () => {
      const res = await axios.post(`/api/resetPassword/${token}`, userData);
      // alert(res.data)

      history.push("/")
    }
    setPassword()
  };

  return (
    <div className="auth_page">
      <form onSubmit={handleSubmit} className="inner-shadow">
        <h3 className="text-uppercase text-center mb-4 auth-heading ">
          Campus Sphere
        </h3>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="pass">
            <div className="outer-shadow hover-in-shadow form-input-wrap">
              <input
                type={typePass ? "text" : "password"}
                className="form-control"
                id="password"
                onChange={handleChangeInput}
                value={password}
                name="password"
                style={{
                  background: `${alert.password ? "#fd2d6a14" : ""} `,
                }}
              />
              <small onClick={() => setTypePass(!typePass)}>
                {typePass ? "Hide" : "Show"}
              </small>
            </div>
          </div>
          <small className="form-text text-danger">
            {alert.password ? alert.password : ""}
          </small>
        </div>

        <div className="mb-3">
          <label htmlFor="cf_password" className="form-label">
            Confirm Password
          </label>
          <div className="pass">
            <div className="outer-shadow hover-in-shadow form-input-wrap">
              <input
                type={typeCfPass ? "text" : "password"}
                className="form-control"
                id="cf_password"
                onChange={handleChangeInput}
                value={cf_password}
                name="cf_password"
                style={{
                  background: `${alert.cf_password ? "#fd2d6a14" : ""} `,
                }}
              />
              <small onClick={() => setTypeCfPass(!typeCfPass)}>
                {typeCfPass ? "Hide" : "Show"}
              </small>
            </div>
          </div>
          <small className="form-text text-danger">
            {alert.cf_password ? alert.cf_password : ""}
          </small>
        </div>
        
        <button
          type="submit"
          className="btn-1 w-100 d-flex outer-shadow hover-in-shadow justify-content-center"
          disabled={(password && cf_password && password === cf_password) ? false : true}
        >
          Set Password
        </button>
        

      </form>
      
    </div>
  );
}

export default ForgotPassword;
