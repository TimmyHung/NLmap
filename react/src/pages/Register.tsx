import React, { useState, useRef, ReactElement } from 'react';
import { Link, Navigate } from 'react-router-dom';
import css from '@/css/Register.module.css';
import postRequest from '@/components/lib/API';
import { useAuth } from '@/components/lib/AuthProvider';
import Swal from 'sweetalert2';

export default function Register(): ReactElement {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const emailNotifyElement = useRef<HTMLDivElement>(null);
  const nameNotifyElement = useRef<HTMLDivElement>(null);
  const { JWTtoken, login } = useAuth();

  if (JWTtoken) {
    return <Navigate to="/" replace />;
  }

  const handleRegister = async () => {
    try {
      if (!account.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Oops...",
          text: "請輸入帳號！",
        });
        return;
      }

      if (!username.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Oops...",
          text: "請輸入使用者名稱！",
        });
        return;
      }

      if (!password.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Oops...",
          text: "請輸入密碼！",
        });
        return;
      }

      const requestData = {
        account: account,
        password: password,
        username: username,
      };

      const response = await postRequest('api/register', requestData);
      if (response.status) {
        login(response.JWTtoken, true);
        <Navigate to="/" />;
      } else {
        if (response.message.includes("Account already exists")) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "帳號已註冊！",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "註冊失敗，請聯繫管理員。",
          });
        }
      }
    } catch (error) {
      console.error("註冊時發生錯誤:", error);
    }
  };

  function terms() {
    Swal.fire({
      title: "喔不!",
      text: "這個東西還沒產出來。",
      imageUrl: "https://i.kym-cdn.com/entries/icons/mobile/000/026/489/crying.jpg",
      imageWidth: 400,
      imageHeight: 200,
      imageAlt: "Custom image"
    });
  }

  function privacy() {
    Swal.fire({
      title: "再等等！",
      text: "你要的東西在路上了。",
      imageUrl: "https://i.imgflip.com/ee9xh.jpg?a476112",
      imageWidth: 400,
      imageHeight: 300,
      imageAlt: "Custom image"
    });
  }

  function validateEmail(focus: boolean) {
    const notifyElement = emailNotifyElement.current;

    if (notifyElement) {
      if (!focus) {
        if (account.length !== 0) {
          const valid = String(account).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
          valid ? notifyElement.className = css.NotifyElement_Off : notifyElement.className = css.NotifyElement_On;
        } else {
          notifyElement.className = css.NotifyElement_Off;
        }
      }
    }
  }

  function validateName(focus: boolean) {
    const notifyElement = nameNotifyElement.current;
    if (notifyElement) {
      focus ? notifyElement.className = css.NotifyElement_On : notifyElement.className = css.NotifyElement_Off;
    }
  }

  return (
    <div className={css.backgroundImage}>
      <div className={css.register_container}>
        <form className={css.center_wrapper}>
          <h1>Create Account</h1>
          <div className={css.regiter_form}>
            <div className={css.form_item}>
              <label>電子郵件<span className="required">*</span></label>
              <div className={css.input_wrapper}>
                <input
                  type="text"
                  id="account"
                  onChange={(e) => setAccount(e.target.value)}
                  onFocus={() => validateEmail(true)}
                  onBlur={() => validateEmail(false)}
                  autoComplete="one-time-code"
                />
              </div>
              <div className={css.NotifyElement_Off} ref={emailNotifyElement}>
                <label><span>輸入一個有效的電子郵件地址</span></label>
              </div>
            </div>

            <div className={css.form_item}>
              <label>密碼<span className="required">*</span></label>
              <div className={css.input_wrapper}>
                <input
                  type="password"
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="one-time-code"
                />
              </div>
            </div>

            <div className={css.form_item}>
              <label>使用者名稱<span className="required">*</span></label>
              <div className={css.input_wrapper}>
                <input
                  type="text"
                  id="username"
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => validateName(true)}
                  onBlur={() => validateName(false)}
                  onKeyUp={(e) => e.key === "Enter" && handleRegister()}
                  maxLength={8}
                  autoComplete="one-time-code"
                />
              </div>
              <div className={css.NotifyElement_Off} ref={nameNotifyElement}>
                <label>長度限制8個字元</label>
              </div>
            </div>

            <div className={css.footer}>
              <div>
                已經有帳號了嗎?<Link to={"/login"}>登入</Link>
              </div>
            </div>
            <div className={css.button_wrapper}>
              <button className={css.button} type="button" onClick={handleRegister}>註冊</button>
            </div>
            <label className={css.statement}>註冊即代表同意 <span onClick={terms}>服務條款</span> 及 <span onClick={privacy}>隱私權政策</span> </label>
          </div>
        </form>
      </div>
    </div>
  );
}