import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/lib/AuthProvider';
import { deleteRequest } from '@/components/lib/API';
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

  const tabs: Tab[] = [
    { id: 'general', label: '一般', icon: 'fa-gear' },
    { id: 'data', label: '歷史紀錄', icon: 'fa-database' },
  ];

  const handleTabClick = (tabId: string) => {
    setSelectedTab(tabId);
  };

  const deleteAccount = () => {
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
        const data = {};
        const response = await deleteRequest('api/authorization/delete', data);
        if (response.status) {
          setSettingVisible(false);
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
          {selectedTab === 'general' && <GeneralSettings deleteAccount={deleteAccount}/>}
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

const GeneralSettings = ({deleteAccount}) => {
  const user = {
    name: 'ɐuı̣ɹɐzɔ',
    avatar: 'https://i.imgur.com/L8GHwbE.png',
  };

  const [nameInput, setNameInput] = useState(user.name);
  const uploadImageRef = useRef<HTMLInputElement>(null);

  const handleNameEdit = () => {
    Toast.fire({
        icon: "error",
        text: "這是不能吃的吐司訊息"
      })
    // if (uploadImageRef.current) {
    //   uploadImageRef.current.focus();
    //   uploadImageRef.current.select();
    // }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value);
  };

  const handleBlurOrEnter = () => {
    console.log("Updated Name:", nameInput);
    // 這裡可以處理提交邏輯，這裡直接輸出結果
  };

  const handlePasswordChange = () => {
    Swal.fire({
      title: '更改密碼',
      html:
        '<input type="password" id="currentPassword" class="swal2-input" placeholder="當前密碼">' +
        '<input type="password" id="newPassword" class="swal2-input" placeholder="新密碼">' +
        '<input type="password" id="confirmPassword" class="swal2-input" placeholder="確認新密碼">',
      focusConfirm: false,
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
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { currentPassword, newPassword } = result.value;
        Swal.fire('成功', '您的密碼已更新', 'success');
      }
    });
  };

  const handleAvatarChange = () => {
    if (uploadImageRef.current) {
      uploadImageRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      Toast.fire({
        icon: "error",
        text: "這是不能吃的吐司訊息"
      })
    }
  };

  return (
    <div className="flex flex-row h-full justify-center items-center gap-8">

        <div className="flex flex-col justify-center items-center gap-2">
            <div className="relative">
                <img
                    src={user.avatar}
                    alt="頭像圖片"
                    className="w-[130px] h-[130px] rounded-full object-cover border border-black"
                />
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
                <div
                //   ref={inputRef}
                  onChange={handleNameChange}
                  onBlur={handleBlurOrEnter}  // 當輸入框失去焦點時處理變更
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleBlurOrEnter(); // 當按下 Enter 時處理變更
                      (e.target as HTMLInputElement).blur(); // 失去焦點
                    }
                  }}
                  className="border-0 rounded px-2 py-1 focus:outline-none"
                >{nameInput}</div>
                <i className="fa-solid fa-pencil cursor-pointer" onClick={handleNameEdit}></i>
              </div>
            </div>
        </div>

        <div className="flex flex-col gap-2">
            <div className="">
                <p className="text-gray-500 text-sm">電子郵件</p>
                <p className="text-base">410631625@gms.tku.edu.tw</p>
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
                    onClick={deleteAccount}
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
