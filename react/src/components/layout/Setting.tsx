import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/lib/AuthProvider';
import { deleteAccount, deleteRequest, updatePassword, updateUserName, uploadAvatar } from '@/components/lib/API';
import Swal from 'sweetalert2';
import Toast from '../ui/Toast';

interface DisableSetting {
  setSettingVisible: (visible: boolean) => void;
}

type Tab = {
  id: string;
  label: string;
  icon: string;
};

const SettingComponent: React.FC<DisableSetting> = ({ setSettingVisible }) => {
  const [selectedTab, setSelectedTab] = useState('general');
  const { JWTtoken, picture, username, account_type, refreshUserInfo, userID, logout, email } = useAuth();

  const tabs: Tab[] = [
    { id: 'general', label: '一般', icon: 'fa-gear' },
    { id: 'data', label: '歷史紀錄', icon: 'fa-database' },
  ];

  const handleTabClick = (tabId: string) => {
    setSelectedTab(tabId);
  };

  return (
    <div className=" bg-white rounded-lg">
      <div className="flex w-full justify-between items-center px-6 py-4 border-b border-gray-200">
        <span className="font-bold text-[1.3rem]">設定</span>
        <button
          className="text-black font-bold"
          onClick={() => setSettingVisible(false)}
        >
          <i className="fa-solid fa-xmark fa-lg"></i>
        </button>
      </div>

      <div className="flex flex-row">
        {/* 左半部 */}
        <div className="min-w-[500px] flex-grow p-4">
          {selectedTab === 'general' && <GeneralSettings JWTtoken={JWTtoken} avatar={picture} username={username} account_type={account_type} refreshUserInfo={refreshUserInfo} setSettingVisible={setSettingVisible} userID={userID} logout={logout} email={email}/>}
          {selectedTab === 'data' && <HistorySettings/>}
        </div>
        {/* 右半部 */}
        <div className="min-w-[200px] min-h-[300px] px-5 border-l border-grey-800 py-4">
          <ul className="list-none p-0">
            {tabs.map((tab) => (
              <li
                key={tab.id}
                className={`flex h-9 px-4 py-2 cursor-pointer gap-2 items-center text-[#0D0D0D] text-[15px] ${
                  selectedTab === tab.id ? 'bg-gray-300 rounded-lg' : ''
                }`}
                onClick={() => handleTabClick(tab.id)}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                {tab.label}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default SettingComponent;

const GeneralSettings = ({JWTtoken, avatar, username, account_type, refreshUserInfo, setSettingVisible, userID, logout, email}) => {

  const [nameInput, setNameInput] = useState(username);
  const uploadImageRef = useRef<HTMLInputElement>(null);

  const handleNameEdit = () => {
    Swal.fire({
      title: '更改名稱',
      input: 'text',
      inputPlaceholder: '請輸入新的名稱',
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      preConfirm: (newName) => {
        if (!newName) {
          Swal.showValidationMessage('名稱不能為空');
          return;
        }
        return newName;
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const newName = result.value;
        try {
          const response = await updateUserName(JWTtoken, newName);
          if (response.statusCode == 200) {
            setNameInput(newName);
            await refreshUserInfo();
            Toast.fire({ icon: 'success', text: '名稱更新成功', timer: 1000});
          } else {
            Toast.fire({ icon: 'error', text: '名稱更新失敗' });
          }
        } catch (error) {
          Toast.fire({ icon: 'error', text: '發生錯誤，請稍後再試' });
        }
      }
    });
  }

  const handleDeleteAccount = () => {
    Swal.fire({
      title: '確定要刪除帳號嗎?',
      text: '這項動作不可復原',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '是的，請刪除！',
      cancelButtonText: '我再考慮一下',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await deleteAccount(JWTtoken, userID, account_type);
        if (response.statusCode == 200) {
          setSettingVisible(false);
          logout("帳號已刪除，您以登出。");
        } else {
          Swal.fire({
            icon: 'error',
            title: '帳號刪除失敗',
            text: response.message,
            footer: '如果你認為這是一項錯誤，請聯絡網站管理員。',
            showConfirmButton: false,
            showCloseButton: true,
          });
        }
      }
    });
  };
  

  const handlePasswordChange = () => {
    if(account_type != "Native"){
      Swal.fire({
        title: "無法更改密碼",
        html: `您目前使用第三方帳號 (${account_type}) 登入<br/>若需要更改密碼，請前往該平台的帳號設定頁進行修改`
      })

      return;
    }
    Swal.fire({
      title: '更改密碼',
      html:
        '<input type="password" id="currentPassword" class="swal2-input" placeholder="當前密碼">' +
        '<input type="password" id="newPassword" class="swal2-input" placeholder="新密碼">' +
        '<input type="password" id="confirmPassword" class="swal2-input" placeholder="確認新密碼">',
      focusConfirm: false,
      confirmButtonText: "確定",
      showCancelButton: true,
      cancelButtonText: "取消",
      preConfirm: () => {
        const currentPassword = (
          Swal.getPopup().querySelector('#currentPassword') as HTMLInputElement
        ).value;
        const newPassword = (
          Swal.getPopup().querySelector('#newPassword') as HTMLInputElement
        ).value;
        const confirmPassword = (
          Swal.getPopup().querySelector('#confirmPassword') as HTMLInputElement
        ).value;
        if (!currentPassword || !newPassword || !confirmPassword) {
          Swal.showValidationMessage('請填寫所有欄位');
          return;
        }
        if (newPassword !== confirmPassword) {
          Swal.showValidationMessage('新密碼與確認密碼不一致');
          return;
        }
        return { currentPassword, newPassword };
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const { currentPassword, newPassword } = result.value;
  
        try {
          const response = await updatePassword(JWTtoken, currentPassword, newPassword);
  
          if (response.statusCode === 200) {
            Swal.fire('成功', '您的密碼已更新', 'success');
          } else {
            Toast.fire({ icon: 'error', text: response.message || '密碼更新失敗，請稍後再試。' });
          }
        } catch (error) {
          Toast.fire({ icon: 'error', text: '發生錯誤，請稍後再試。' });
        }
      }
    });
  };

  const handleAvatarChange = () => {
    if (uploadImageRef.current) {
      uploadImageRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      try {
        const response = await uploadAvatar(JWTtoken, file);
        if (response.statusCode == 200) {
          await refreshUserInfo();
          Toast.fire({ icon: 'success', text: '頭像更新成功', timer: 1000 });
        } else {
          Toast.fire({ icon: 'error', text: '頭像更新失敗' });
        }
      } catch (error) {
        Toast.fire({ icon: 'error', text: '發生錯誤，請稍後再試' });
      }
    }
  }

  return (
    <div className="flex flex-row h-full justify-center items-center gap-8">

        <div className="flex flex-col justify-center items-center gap-2">
            <div className="relative">
                {
                  avatar ?
                  <img
                    src={avatar}
                    alt="頭像圖片"
                    className="w-[130px] h-[130px] rounded-full object-cover border border-black bg-black"
                  />
                  : <div className="w-[130px] h-[130px] rounded-full border border-black flex justify-center items-center text-3xl bg-black text-white">{username?.charAt(0)}</div>
                }
                <div
                    className="absolute bottom-0 right-0 bg-slateBlue rounded-full p-1 hover:bg-darkSlateBlue text-white cursor-pointer"
                    onClick={handleAvatarChange}
                >
                  <i className="fa-solid fa-camera fa-sm p-2"></i>
                </div>
                <input
                    type="file"
                    accept=".heic, .jpeg, .jpg, .png, .webp"
                    ref={uploadImageRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </div>
            
            <div className="">
              <div className="flex items-center gap-1">
                <div className="border-0 rounded px-2 py-1 focus:outline-none">{nameInput}</div>
                <i className="fa-solid fa-pencil cursor-pointer" onClick={handleNameEdit}></i>
              </div>
            </div>
        </div>

        <div className="flex flex-col gap-2">
            <div className="">
                <p className="text-gray-500 text-sm">電子郵件</p>
                <p className="text-base">{email}</p>
            </div>

            <div className="flex flex-col items-start">
                <p className="text-gray-500 text-sm">密碼</p>
                <p className="text-base flex items-center gap-1">
                  **********
                  <span
                    className="text-base cursor-pointer hover:text-red-500"
                    onClick={handlePasswordChange}
                  >
                    (更改密碼)
                  </span>
                </p>
            </div>
            
            <div className="">
                {/* <p className="text-gray-500 text-sm">不想活了</p> */}
                <div
                    className="max-w-[80px] px-2 py-2 flex items-center justify-center bg-slateBlue hover:bg-red-700 text-white text-sm shadow-none rounded-xl cursor-pointer"
                    onClick={handleDeleteAccount}
                >
                    刪除帳號
                </div>
            </div>
        </div>
    </div>
  );
};

const HistorySettings = () => {

    const showInfo1 = () =>{
        Swal.fire({
            icon: "info",
            html: `
                <div style="text-align: start;">
                    篩選縣市的下拉式選單，是否只顯示篩選後有結果的縣市選項。
                </div>
            `,
            confirmButtonText: "知道了"
        });
    }

    const showInfo2 = () =>{
        Swal.fire({
            icon: "info",
            html: `
                <div style="text-align: center;">
                    隱藏完全沒有名稱資料的地點。
                </div>
            `,
            confirmButtonText: "知道了"
        });
    }

    const showInfo3 = () =>{
      Swal.fire({
          icon: "info",
          html: `
              <div style="text-align: start;">
                  將地點從歷史紀錄加入收藏後，是否自動從歷史紀錄中移除該地點。
              </div>
          `,
          confirmButtonText: "知道了"
      });
  }


    const showInfo4 = () =>{
        Swal.fire({
            icon: "info",
            html: `
                <div style="text-align: left;">
                    對於沒有詳細地址的地點，需要透過國土測繪中心取得其所在鄉鎮市區的大概位置。
                    設置一個資料筆數上限，當超過這個數量的資料則地址顯示"未知"。
                </div>
            `,
            footer: "這麼做的好處是可以加快載入時間，並節省電腦資源！",
            confirmButtonText: "知道了"
        });
    }
    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center py-2 min-h-[45px] border-b border-gray-200">
                <div className="flex gap-2 items-center justify-center">
                    <label>縣市篩選-只顯示有結果的縣市</label>
                    <i className="fa-solid fa-circle-question cursor-pointer" onClick={()=>showInfo1()}></i>
                </div>
                <input type="checkbox" checked readOnly/>
            </div>
            <div className="flex justify-between items-center py-2 min-h-[45px] border-b border-gray-200">
                <div className="flex gap-2 items-center justify-center">
                    <label>隱藏沒有名稱的地點</label>
                    <i className="fa-solid fa-circle-question cursor-pointer" onClick={()=>showInfo2()}></i>
                </div>
                <input type="checkbox" checked readOnly/>
            </div>
            <div className="flex justify-between items-center py-2 min-h-[45px] border-b border-gray-200">
                <div className="flex gap-2 items-center justify-center">
                    <label>將地點加入收藏後從歷史紀錄中移除</label>
                    <i className="fa-solid fa-circle-question cursor-pointer" onClick={()=>showInfo3()}></i>
                </div>
                <input type="checkbox"/>
            </div>
            <div className="flex justify-between items-center py-2 min-h-[45px] border-b border-gray-200">
                <div className="flex gap-2 items-center justify-center">
                    <label>無地址地點的地理位置查詢資料上限</label>
                    <i className="fa-solid fa-circle-question cursor-pointer" onClick={()=>showInfo4()}></i>
                </div>
                <input type="text" className="text-base w-[60px] px-2 text-center border border-gray-400 rounded-lg" value={500} readOnly/>
            </div>
        </div>
    );
};
