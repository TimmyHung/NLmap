import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { verifyJWT } from './API';
import { googleLogout } from '@react-oauth/google';
import Swal from 'sweetalert2';

interface AuthContextType {
  JWTtoken: string | null;
  username: string | null;
  role: string | null;
  picture: string | null;
  account_type: string | null;
  userID: string | null;
  login: (token: string, firstTime: boolean) => Promise<void>;
  logout: (title: string, text: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [JWTtoken, setJWTtoken] = useState<string | null>();
  const [username, setUsername] = useState<string | null>('');
  const [role, setRole] = useState<string | null>('');
  const [picture, setPicture] = useState<string | null>('');
  const [account_type, setAccountType] = useState<string | null>('');
  const [userID, setUserID] = useState<string | null>('');

  useEffect(() => {
    if (JWTtoken) {
      const fetchData = async () => {
        const response = await verifyJWT(JWTtoken);
        switch (response.message) {
          case "Token Expired":
            logout("您已登出", "帳號驗證已過期請重新登入");
            break;
          case "Token Invalid":
            logout("您已登出", "帳號驗證問題請重新登入");
            break;
          case "Unknown Error":
            logout("您已登出", "帳號驗證問題請重新登入");
            break;
          case "Timeout":
            logout("您已登出", "帳號驗證問題請重新登入");
            break;
          case "Token Normal":
            setUsername(response.data.username);
            setRole(response.data.role);
            setPicture(response.data.picture);
            setAccountType(response.data.account_type);
            setUserID(response.data.userID);
            break;
        }
      };
      fetchData();
    }
  }, [JWTtoken]);

  const navigate = useNavigate();
  const login = async (token: string, firstTime: boolean) => {
    localStorage.setItem('JWTtoken', token);
    setJWTtoken(token);
    navigate("/");
    if(firstTime)
      Swal.fire({
        icon: "success",
        title: firstTime ? "註冊成功" : "登入成功",
        showConfirmButton: true,
        timer: 2000
      });
  };

  const logout = (title: string, text: string) => {
    localStorage.removeItem('JWTtoken');

    setJWTtoken(null);
    setUsername(null);
    setRole(null);
    googleLogout();

    Swal.fire({
      icon: "success",
      title: title,
      text: text,
      showConfirmButton: true,
      timer: 2000
    });
  };

  return (
    <AuthContext.Provider value={{ JWTtoken, username, role, picture, login, logout, account_type, userID }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
