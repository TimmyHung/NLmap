import React, { useState, useEffect, ReactElement } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import css from '@/css/Login.module.css';
import postRequest from '@/components/lib/API';
import { useAuth } from '@/components/lib/AuthProvider';
import Swal from 'sweetalert2';

export default function Login(): ReactElement {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignIn, setKeepSignIn] = useState(false);
  const navigate = useNavigate();
  const { login, JWTtoken } = useAuth();

  useEffect(() => {
    if (JWTtoken) {
      navigate("/");
    }
  }, [JWTtoken, navigate]);

  const handleLogin = async () => {
    try {
      if (!account.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Oops...",
          text: "請輸入帳號！",
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
        password: password
      };
      const response = await postRequest('api/login', requestData);
      // 登入成功
      if (response.status) {
        const JWTtoken = response.JWTtoken;
        login(JWTtoken, false);
      } else {
        if (response.message.includes("Invalid account or password")) {
          // 密碼錯誤
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "帳號或密碼不正確！",
          });
        } else if (response.message.includes("Account is not exists")) {
          // 帳號不存在
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "帳號或密碼不正確！",
          });
        } else {
          // 其他登入失敗原因
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "登入失敗，請聯繫管理員。",
          });
        }
      }
    } catch (error) {
      console.error("登入時發生錯誤:", error);
      // 處理登入時的錯誤
    }
  };

  async function passwordRecovery() {
    const { value: email } = await Swal.fire({
      title: "請輸入你的登入信箱",
      input: "email",
      showCancelButton: true,
      confirmButtonText: "繼續",
      cancelButtonText: "取消",
      inputPlaceholder: "在這輸入你的信箱",
      validationMessage: "請輸入正確的信箱格式",
    });
    if (email) {
      Swal.fire("信件還沒有發送至你的信箱\n請不要查收！！！");
    }
  }

  return (
    <div className={css.backgroundImage}>
      <div className={css.mainContainer}>
        <div className={css.title}>
          <h1>Sign in</h1>
        </div>
        <div className={css.login_container}>
          <form className={css.login_form}>
            <div className={css.form_group}>
              <label className={css.label}>帳號</label>
              <input
                className={css.input}
                type="text"
                id="username"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                required
              />
            </div>
            <div className={css.form_group}>
              <label className={css.label}>密碼</label>
              <input
                className={css.input}
                type="password"
                id="password"
                autoComplete="on"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={(e) => e.key === "Enter" && handleLogin()}
                required
              />
            </div>
            <div className={css.checkbox_div}>
              <div className={css.round}>
                <input type="checkbox" id="checkbox" onChange={() => setKeepSignIn(!keepSignIn)} />
                <label htmlFor="checkbox"></label>
              </div>
              <div className={css.checkbox_div_innerText}>讓我保持登入</div>
            </div>
            <button className={css.button} type="button" onClick={handleLogin}>登入</button>
          </form>
          <div className={css.register_link}>
            <a onClick={passwordRecovery}>忘記密碼</a>
          </div>
        </div>
        {/* <div className={css.footer}>
          <div>
            <label>還沒註冊?<Link className={css.register_link} to={"/register"}>馬上加入</Link></label>
          </div>
        </div> */}
      </div>
    </div>
  );
}
