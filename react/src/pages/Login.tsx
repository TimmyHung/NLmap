import { useState, useEffect, ReactElement } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GoogleLoginBtn, { DiscordLoginBtn, AppleLoginBtn } from '@/components/ui/OAuth_Button';
import css from '@/css/Login.module.css';
import postRequest, { resetPassword, sendOTP } from '@/components/lib/API';
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
    await Swal.fire({
      title: "請輸入你的登入信箱",
      input: "email",
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: true,
      confirmButtonText: "繼續",
      cancelButtonText: "取消",
      inputPlaceholder: "在這輸入你的信箱",
      validationMessage: "請輸入正確的信箱格式",
      showLoaderOnConfirm: true,
      preConfirm: async (email) => {
        try {
          const response = await sendOTP(email);  // 發送 OTP 請求
          if (response.statusCode != 200) {
            return Swal.showValidationMessage(`發生錯誤: ${response.message}`);
          }
          return response;
        } catch (error) {
          return Swal.showValidationMessage(`重置密碼失敗: ${error}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then(async (response) => {
      if (response.isConfirmed) {
        // 進入 OTP 驗證和密碼重設流程
        await Swal.fire({
          title: "輸入六位數驗證碼和新密碼",
          html: `
            <input type="text" id="otp" class="swal2-input" placeholder="6位數驗證碼" maxlength="6" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 6)">
            <input type="password" id="newPassword" class="swal2-input" placeholder="新密碼">
            <input type="password" id="confirmPassword" class="swal2-input" placeholder="再次輸入新密碼">
          `,
          showCancelButton: true,
          confirmButtonText: "重設密碼",
          cancelButtonText: "取消",
          showLoaderOnConfirm: true,
          preConfirm: async () => {
            const otpInput = Swal.getPopup().querySelector("#otp") as HTMLInputElement;
            const newPasswordInput = Swal.getPopup().querySelector("#newPassword") as HTMLInputElement;
            const confirmPasswordInput = Swal.getPopup().querySelector("#confirmPassword") as HTMLInputElement;
  
            const otp = otpInput.value;
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;
  
            // 驗證 OTP
            if (!otp || otp.length !== 6) {
              return Swal.showValidationMessage("請輸入六位數驗證碼");
            }
            // 驗證新密碼
            if (!newPassword) {
              return Swal.showValidationMessage("請輸入新密碼");
            }
            // 驗證確認密碼
            if (newPassword !== confirmPassword) {
              return Swal.showValidationMessage("重複輸入的密碼不一致，請再次確認。");
            }
  
            try {
              const resetResponse = await resetPassword(response.value.email, otp, newPassword); 
              if (resetResponse.statusCode != 200) {
                return Swal.showValidationMessage(`發生錯誤: ${resetResponse.message}`);
              }
              return resetResponse;
            } catch (error) {
              return Swal.showValidationMessage(`重設密碼失敗: ${error}`);
            }
          },          
          allowOutsideClick: () => !Swal.isLoading(),
        }).then((resetResponse) => {
          if (resetResponse.isConfirmed) {
            Swal.fire({
              icon: "success",
              title: "密碼已成功重設",
              confirmButtonText: "確定"
            });
          }
        });
      }
    });
  }

  return (
    <div className={"h-full w-full flex justify-center " + css.backgroundImage}>
        <div className="self-center py-8 px-8 md:px-12 rounded-xl bg-[#f9f9f9] m-8 w-full max-w-[450px] shadow-xl">
          <div className="text-4xl w-full flex justify-center pb-6">
            <h1>Sign in</h1>
          </div>
          <form className="">
            <div className="flex flex-col pb-1">
              <label className="">帳號</label>
              <input
                className="w-full h-12"
                type="text"
                id="username"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col pb-8">
              <label className="">密碼</label>
              <input
                className="w-full h-12"
                type="password"
                id="password"
                autoComplete="on"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={(e) => e.key === "Enter" && handleLogin()}
                required
              />
            </div>

            <button className="w-full h-12 bg-[#42cb83] hover:bg-[#3dbb78] rounded-[30px] mb-2 text-lg font-bold" type="button" onClick={handleLogin}>登入</button>
          </form>
          <div className="flex gap-1 justify-center text-sm">
            <span><a onClick={passwordRecovery} className="font-bold text-black">忘記密碼</a></span>
            |
            <span>還沒有帳號?<Link to="/register" className="font-bold text-black"> 註冊</Link></span>
          </div>
          <div className="flex items-center w-full mx-auto py-4">
            <div className="flex-1 border-b border-gray-300"></div>
            <span className="px-2">或</span>
            <div className="flex-1 border-b border-gray-300"></div>
          </div>

          <div className="flex flex-row w-full justify-center gap-2">
            <GoogleLoginBtn onSuccess={handleAuthResponse}/>
            <AppleLoginBtn onSuccess={handleAuthResponse}/>
            <DiscordLoginBtn onSuccess={handleAuthResponse}/>
          </div>
        </div>
    </div>
  );
}
