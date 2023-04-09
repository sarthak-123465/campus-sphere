import React, { useEffect } from 'react';
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import axios from 'axios';

const Verify = () => {
  const {auth, alert} = useSelector(state => state);
  const { token } = useParams();
  const history = useHistory();

  useEffect(() => {
    const verifyToken = async () => {
      const res = await axios.get(`/api/verify/${token}`);
      alert(res.data)

      history.push("/")
    }
    if (auth.token) history.push("/")
    else verifyToken()
  }, [auth.token, history])

  return (
    <div className="container1">
    </div>
  );
}

export default Verify;
