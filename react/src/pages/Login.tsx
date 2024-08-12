import { useState, useEffect, ReactElement } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GoogleLoginBtn, { DiscordLoginBtn, AppleLoginBtn } from '@/components/ui/OAuth_Button';
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
        type: "Native",
        email: account,
        password: password
      };
      const response = await postRequest('api/authorization/login', requestData);
      handleAuthResponse(response)
  };

  async function handleAuthResponse(response){
    try {
      if(!response) return;
      // 登入成功
      if (response.status) {
        const JWTtoken = response.JWTtoken;
        console.log(JWTtoken)
        login(JWTtoken, false);
      }else{
        if (response.message.includes("Invalid account or password")) {
          // 密碼錯誤
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "帳號或密碼不正確！",
          });
        } else if (response.message.includes("Account does not exist")) {
          // 帳號不存在
          Swal.fire({
            icon: "question",
            title: "Oops...",
            text: "帳號或密碼不存在！",
          });
        }else if(response.message.includes("Login Failed: account exists")){
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "帳號已註冊，請使用" + (response.account_type == "Native" ? "網頁一般" : response.account_type) + "登入。",
          });
        } else {
          // 其他登入失敗原因
          Swal.fire({
            icon: "error",
            title: "登入失敗",
            text: response.message,
            footer: '如果你認為這是一項錯誤，請聯絡網站管理員。',
            showConfirmButton: false,
            showCloseButton: true
          });
        }
      }
    }catch (error) {
      // console.error("登入時發生錯誤:", error);
      // 處理登入時的錯誤
    }
  }

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
        <div className={css.login_container}>
          <div className={css.title}>
            <h1>Sign in</h1>
          </div>
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
              <div className={css.checkbox_div_innerText}>記住此帳號</div>
            </div>
            <button className={css.button} type="button" onClick={handleLogin}>登入</button>
          </form>
          <div className={css.link}>
            <span><a onClick={passwordRecovery}>忘記密碼</a></span>
            |
            <span>還沒有帳號?<Link to="/register"> 註冊</Link></span>
          </div>
          <div className={css.divider_wrapper}>
            <span className={css.divider}>或</span>
          </div>

          <div className={css.oauth_section}>
            <GoogleLoginBtn onSuccess={handleAuthResponse}/>
            <AppleLoginBtn onSuccess={handleAuthResponse}/>
            <DiscordLoginBtn onSuccess={handleAuthResponse}/>
          </div>
        </div>
    </div>
  );
}
