import { useState, useRef, ReactElement, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import css from '@/css/Register.module.css';
import postRequest from '@/components/lib/API';
import { useAuth } from '@/components/lib/AuthProvider';
import Swal from 'sweetalert2';

export default function Register(): ReactElement {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [accountValid, setAccountValid] = useState(false);
  const buttonElement = useRef<HTMLButtonElement>(null);
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
        email: account,
        password: password,
        username: username,
      };

      const response = await postRequest('api/authorization/register', requestData);
      if (response.status) {
        login(response.JWTtoken, true);
        <Navigate to="/" />;
      } else {
        if (response.message.includes("Account already exists")) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "帳號已註冊，請使用" + (response.account_type == "Native" ? "網頁一般" : response.account_type) + "登入。",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "註冊失敗",
            text: response.message,
            footer: '如果你認為這是一項錯誤，請聯絡網站管理員。',
            showConfirmButton: false,
            showCloseButton: true
        });
        }
      }
    } catch (error) {
      console.error("註冊時發生錯誤:", error);
    }
  };

  function terms() {
    Swal.fire({
      title: "服務條款",
        html: `
            <div style="text-align: left;">
                <strong>前言</strong><br>
                歡迎使用我們的服務。在使用本網站或服務之前，請仔細閱讀這些服務條款。使用本服務即表示您同意並接受這些條款。<br><br>
                
                <strong>接受條款</strong><br>
                使用本網站或服務即表示您同意遵守這些條款。如果您不同意，請勿使用本網站或服務。<br><br>
                
                <strong>服務說明</strong><br>
                本網站提供【服務簡述】。我們可能不時更新或變更服務內容。<br><br>
                
                <strong>使用者義務</strong><br>
                使用者同意遵守所有適用法律法規，並承諾不會進行以下行為：<br>
                - 未經授權的訪問或干擾網站運作。<br>
                - 發布或傳播非法或不當內容。<br><br>
                
                <strong>隱私權保護</strong><br>
                我們非常重視您的隱私權，詳情請參考我們的隱私權政策。<br><br>
                
                <strong>知識產權</strong><br>
                本網站及其所有內容（包括但不限於文本、圖片、標誌、圖形）均屬於本網站或相關權利人所有。未經授權，禁止複製、修改或分發。<br><br>
                
                <strong>使用限制</strong><br>
                使用者不得從事逆向工程、解密或其他非法行為。<br><br>
                
                <strong>責任限制</strong><br>
                在法律允許的最大範圍內，本網站不對因使用本服務所產生的任何損害負責。<br><br>
                
                <strong>服務變更與終止</strong><br>
                我們保留隨時修改或終止服務的權利，並不對使用者承擔任何責任。<br><br>
                
                <strong>賠償</strong><br>
                使用者同意對因其違反本條款而導致的任何索賠、損害或費用進行賠償。<br><br>
                
                <strong>法律適用與管轄</strong><br>
                本條款受【適用法律】的管轄，並且所有爭議應由【指定法院】解決。<br><br>
                
                <strong>條款的修訂</strong><br>
                我們保留隨時修訂這些條款的權利，修訂後的條款將在網站上公佈並生效。<br><br>
                
                <strong>聯繫方式</strong><br>
                如果您對這些條款有任何疑問，請聯繫我們：ooo@example.com。
            </div>
        `
    });
  }

  function privacy() {
    Swal.fire({
      title: "隱私權政策",
      html: `<div style="text-align: left;">
        <p>非常歡迎您光臨「NLmap網站」（以下簡稱本網站），為了讓您能夠安心的使用本網站的各項服務與資訊，特此向您說明本網站的隱私權保護政策，以保障您的權益，請您詳閱下列內容：</p>
        
        <p><strong>一、隱私權保護政策的適用範圍</strong><br>
        隱私權保護政策內容，包括本網站如何處理在您使用網站服務時收集到的個人識別資料。隱私權保護政策不適用於本網站以外的相關連結網站，也不適用於非本網站所委託或參與管理的人員。</p>

        <p><strong>二、個人資料的蒐集、處理及利用方式</strong><br>
        1. 當您造訪本網站或使用本網站所提供之功能服務時，我們將視該服務功能性質，請您提供必要的個人資料，並在該特定目的範圍內處理及利用您的個人資料；非經您書面同意，本網站不會將個人資料用於其他用途。<br>
        2. 本網站在您使用服務信箱、問卷調查等互動性功能時，會保留您所提供的姓名、電子郵件地址、聯絡方式及使用時間等。<br>
        3. 於一般瀏覽時，伺服器會自行記錄相關行徑，包括您使用連線設備的 IP 位址、使用時間、使用的瀏覽器、瀏覽及點選資料記錄等，做為我們增進網站服務的參考依據，此記錄為內部應用，決不對外公佈。<br>
        4. 為提供精確的服務，我們會將收集的問卷調查內容進行統計與分析，分析結果之統計數據或說明文字呈現，除供內部研究外，我們會視需要公佈統計數據及說明文字，但不涉及特定個人之資料。<br>
        5. 您可以隨時向我們提出請求，以更正或刪除您的帳戶或本網站所蒐集的個人資料等隱私資訊。聯繫方式請見最下方聯繫管道。</p>

        <p><strong>三、資料之保護</strong><br>
        1. 本網站主機均設有防火牆、防毒系統等相關的各項資訊安全設備及必要的安全防護措施，加以保護網站及您的個人資料採用嚴格的保護措施，只由經過授權的人員才能接觸您的個人資料，相關處理人員皆簽有保密合約，如有違反保密義務者，將會受到相關的法律處分。<br>
        2. 如因業務需要有必要委託其他單位提供服務時，本網站亦會嚴格要求其遵守保密義務，並且採取必要檢查程序以確定其將確實遵守。</p>

        <p><strong>四、網站對外的相關連結</strong><br>
        本網站的網頁提供其他網站的網路連結，您也可經由本網站所提供的連結，點選進入其他網站。但該連結網站不適用本網站的隱私權保護政策，您必須參考該連結網站中的隱私權保護政策。</p>
        
        <p><strong>五、與第三人共用個人資料之政策</strong><br>
        本網站絕不會提供、交換、出租或出售任何您的個人資料給其他個人、團體、私人企業或公務機關，但有法律依據或合約義務者，不在此限。</p>

        <p>前項但書之情形包括不限於：<br>
        1. 經由您書面同意。<br>
        2. 法律明文規定。<br>
        3. 為免除您生命、身體、自由或財產上之危險。<br>
        4. 與公務機關或學術研究機構合作，基於公共利益為統計或學術研究而有必要，且資料經過提供者處理或蒐集者依其揭露方式無從識別特定之當事人。<br>
        5. 當您在網站的行為，違反服務條款或可能損害或妨礙網站與其他使用者權益或導致任何人遭受損害時，經網站管理單位研析揭露您的個人資料是為了辨識、聯絡或採取法律行動所必要者。<br>
        6. 有利於您的權益。<br>
        7. 本網站委託廠商協助蒐集、處理或利用您的個人資料時，將對委外廠商或個人善盡監督管理之責。</p>

        <p><strong>六、Cookie 之使用</strong><br>
        為了提供您最佳的服務，本網站會在您的電腦中放置並取用我們的 Cookie，若您不願接受 Cookie 的寫入，您可在您使用的瀏覽器功能項中設定隱私權等級為高，即可拒絕 Cookie 的寫入，但可能會導致網站某些功能無法正常執行。</p>

        <p><strong>七、隱私權保護政策之修正</strong><br>
        本網站隱私權保護政策將因應需求隨時進行修正，修正後的條款將刊登於網站上。</p>

        <p><strong>八、聯繫管道</strong><br>
        對於本站之隱私權政策有任何疑問，或者想提出變更、移除個人資料之請求，請Email 至：ooo@example.com</p>
      </div>`
    });
}





  function validateEmail(focus: boolean) {
    const notifyElement = emailNotifyElement.current;

    if (notifyElement) {
      if (!focus) {
        if (account.length !== 0) {
          const valid = String(account).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
          valid ? notifyElement.className = css.NotifyElement_Off : notifyElement.className = css.NotifyElement_On;
          setAccountValid(false);
        } else {
          notifyElement.className = css.NotifyElement_Off;
          setAccountValid(true);
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
                  type="email"
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
              <button ref={buttonElement} className={css.button} type="button" onClick={handleRegister}>註冊</button>
            </div>
            <label className={css.statement}>註冊即代表同意 <span onClick={terms}>服務條款</span> 及 <span onClick={privacy}>隱私權政策</span> </label>
          </div>
        </form>
      </div>
    </div>
  );
}