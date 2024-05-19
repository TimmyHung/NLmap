import React, { createContext, useContext, useState, useEffect } from 'react';
import {Navigate} from 'react-router-dom';
import { verifyJWT } from './API.jsx'

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [JWTtoken, setJWTtoken] = useState(localStorage.getItem('JWTtoken') || '');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    if (JWTtoken) {
      const fetchData = async () => {
        const response = await verifyJWT(JWTtoken);
        console.log(response)
        switch(response.code){
          case "Token Expired":
            logout("您已登出","帳號驗證已過期請重新登入")
            break;
          case "Token Invalid":
            logout("您已登出","帳號驗證問題請重新登入")
            break;
          case "Unknown Error":
            logout("您已登出","帳號驗證問題請重新登入")
            break;
          case "Timeout":
            logout("您已登出","帳號驗證問題請重新登入")
            break;
          case "Token Normal":
            setUsername(response.data.username);
            setRole(response.data.role);
            break;
        }
      };
      fetchData();
    }
  }, [JWTtoken]);

  const login = async (token, firstTime) => {
    localStorage.setItem('JWTtoken', token);
    setJWTtoken(token);
    <Navigate to="/"/>
    Swal.fire({
      // position: "top-end",
      icon: "success",
      title: firstTime? "註冊成功":"登入成功",
      showConfirmButton: true,
      timer: 2000
    });
  };

  const logout = (title, text) => {
    localStorage.removeItem('JWTtoken');
    setJWTtoken(null);
    setUsername(null);
    setRole(null);
    Swal.fire({
      // position: "top-end",
      icon: "success",
      title: title,
      text: text,
      showConfirmButton: true,
      timer: 2000
    });
  };

  return (
    <AuthContext.Provider id="authContext" value={{ JWTtoken, username, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
