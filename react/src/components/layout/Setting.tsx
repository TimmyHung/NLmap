import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/lib/AuthProvider';
import {
  deleteAccount,
  deleteRequest,
  getUserSetting,
  updatePassword,
  updateUserName,
  updateUserSetting,
  uploadAvatar,
} from '@/components/lib/API';
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
  const {
    JWTtoken,
    picture,
    username,
    account_type,
    refreshUserInfo,
    userID,
    logout,
    email,
  } = useAuth();

  const tabs: Tab[] = [
    { id: 'general', label: '一般', icon: 'fa-gear' },
    { id: 'data', label: '歷史紀錄', icon: 'fa-database' },
  ];

  const handleTabClick = (tabId: string) => {
    setSelectedTab(tabId);
  };

  return (
    <div className="w-full mx-8 md:mx-0 md:w-auto bg-white rounded-lg">
      <div className="flex w-full justify-between items-center px-6 py-4 border-b border-gray-200">
        <span className="font-bold text-[1.3rem]">設定</span>
        <button
          className="text-black font-bold"
          onClick={() => setSettingVisible(false)}
        >
          <i className="fa-solid fa-xmark fa-lg"></i>
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* 左半部 */}
        <div className="w-full md:min-w-[500px] md:flex-grow p-4">
          {selectedTab === 'general' && (
            <GeneralSettings
              JWTtoken={JWTtoken}
              avatar={picture}
              username={username}
              account_type={account_type}
              refreshUserInfo={refreshUserInfo}
              setSettingVisible={setSettingVisible}
              userID={userID}
              logout={logout}
              email={email}
            />
          )}
          {selectedTab === 'data' && <HistorySettings />}
        </div>
        {/* 右半部 */}
        <div className="w-full md:min-w-[200px] md:min-h-[300px] px-5 border-t md:border-t-0 md:border-l border-grey-800 py-4">
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

const GeneralSettings = ({
  JWTtoken,
  avatar,
  username,
  account_type,
  refreshUserInfo,
  setSettingVisible,
  userID,
  logout,
  email,
}) => {
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
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const newName = result.value;
        try {
          const response = await updateUserName(JWTtoken, newName);
          if (response.statusCode === 200) {
            setNameInput(newName);
            await refreshUserInfo();
            Toast.fire({
              icon: 'success',
              text: '名稱更新成功',
              timer: 1000,
            });
          } else {
            Toast.fire({ icon: 'error', text: '名稱更新失敗' });
          }
        } catch (error) {
          Toast.fire({ icon: 'error', text: '發生錯誤，請稍後再試' });
        }
      }
    });
  };

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
        if (response.statusCode === 200) {
          setSettingVisible(false);
          logout('帳號已刪除，您已登出。');
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
    if (account_type !== 'Native') {
      Swal.fire({
        title: '無法更改密碼',
        html: `您目前使用第三方帳號 (${account_type}) 登入<br/>若需要更改密碼，請前往該平台的帳號設定頁進行修改`,
      });

      return;
    }
    Swal.fire({
      title: '更改密碼',
      html:
        '<input type="password" id="currentPassword" class="swal2-input" placeholder="當前密碼">' +
        '<input type="password" id="newPassword" class="swal2-input" placeholder="新密碼">' +
        '<input type="password" id="confirmPassword" class="swal2-input" placeholder="確認新密碼">',
      focusConfirm: false,
      confirmButtonText: '確定',
      showCancelButton: true,
      cancelButtonText: '取消',
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
          const response = await updatePassword(
            JWTtoken,
            currentPassword,
            newPassword
          );

          if (response.statusCode === 200) {
            Swal.fire('成功', '您的密碼已更新', 'success');
          } else {
            Toast.fire({
              icon: 'error',
              text: response.message || '密碼更新失敗，請稍後再試。',
            });
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

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      try {
        const response = await uploadAvatar(JWTtoken, file);
        if (response.statusCode === 200) {
          await refreshUserInfo();
          Toast.fire({ icon: 'success', text: '頭像更新成功', timer: 1000 });
        } else {
          Toast.fire({ icon: 'error', text: '頭像更新失敗' });
        }
      } catch (error) {
        Toast.fire({ icon: 'error', text: '發生錯誤，請稍後再試' });
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full justify-center items-center gap-8">
      <div className="flex flex-col justify-center items-center gap-2">
        <div className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt="頭像圖片"
              className="w-32 h-32 md:w-[130px] md:h-[130px] rounded-full object-cover border border-black bg-black"
            />
          ) : (
            <div className="w-32 h-32 md:w-[130px] md:h-[130px] rounded-full border border-black flex justify-center items-center text-3xl bg-black text-white">
              {username?.charAt(0)}
            </div>
          )}
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
            <div className="border-0 rounded px-2 py-1 focus:outline-none">
              {nameInput}
            </div>
            <i
              className="fa-solid fa-pencil cursor-pointer"
              onClick={handleNameEdit}
            ></i>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full md:w-auto">
        <div className="">
          <p className="text-gray-500 text-sm">電子郵件</p>
          <p className="text-sm md:text-base">{email}</p>
        </div>

        <div className="flex flex-col items-start">
          <p className="text-gray-500 text-sm">密碼</p>
          <p className="text-sm md:text-base flex items-center gap-1">
            **********
            <span
              className="text-sm md:text-base cursor-pointer hover:text-red-500"
              onClick={handlePasswordChange}
            >
              (更改密碼)
            </span>
          </p>
        </div>

        <div className="">
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
  const { JWTtoken } = useAuth(); // 取得使用者的 JWT token

  // 將設定的狀態設置為 undefined, 直到我們獲取後端的資料
  const [filterCities, setFilterCities] = useState<boolean | undefined>(
    undefined
  );
  const [hideUnknownRecords, setHideUnknownRecords] = useState<
    boolean | undefined
  >(undefined);
  const [removeRecordAfterAddToFavorite, setRemoveRecordAfterAddToFavorite] =
    useState<boolean | undefined>(undefined);
  const [skipFetchLocationInfo, setSkipFetchLocationInfo] = useState<
    number | undefined
  >(undefined);

  // 載入當前使用者的設定
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await getUserSetting(JWTtoken);
        // console.log(response);
        if (response.statusCode === 200) {
          const {
            filterCities,
            hideUnknownRecords,
            removeRecordAfterAddToFavorite,
            skipFetchLocationInfo,
          } = response.settings;
          setFilterCities(filterCities);
          setHideUnknownRecords(hideUnknownRecords);
          setRemoveRecordAfterAddToFavorite(removeRecordAfterAddToFavorite);
          setSkipFetchLocationInfo(skipFetchLocationInfo);
        } else {
          Toast.fire({
            icon: 'error',
            text: '無法取得使用者設定，請稍後再試',
          });
        }
      } catch (error) {
        Toast.fire({ icon: 'error', text: '發生錯誤，無法取得設定' });
      }
    };

    loadSettings();
  }, [JWTtoken]);

  const handleSaveSettings = async () => {
    const settings = {
      filterCities,
      hideUnknownRecords,
      removeRecordAfterAddToFavorite,
      skipFetchLocationInfo,
    };

    const response = await updateUserSetting(JWTtoken, settings);
    // console.log(response);
    if (response.statusCode === 200) {
      Toast.fire({ icon: 'success', text: '設定已成功更新', timer: 1500 });
    } else {
      Toast.fire({
        icon: 'error',
        text: response?.message || '更新失敗，請稍後再試',
      });
    }
  };

  if (
    filterCities === undefined ||
    hideUnknownRecords === undefined ||
    removeRecordAfterAddToFavorite === undefined ||
    skipFetchLocationInfo === undefined
  ) {
    return <div></div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 min-h-[45px] border-b border-gray-200">
        <div className="flex gap-2 items-center justify-center">
          <label>縣市篩選 - 只顯示有結果的縣市</label>
        </div>
        <input
          type="checkbox"
          className="w-4 h-4 cursor-pointer mt-2 sm:mt-0"
          checked={filterCities}
          onChange={() => setFilterCities(!filterCities)}
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 min-h-[45px] border-b border-gray-200">
        <div className="flex gap-2 items-center justify-center">
          <label>隱藏沒有名稱的地點</label>
        </div>
        <input
          type="checkbox"
          className="w-4 h-4 cursor-pointer mt-2 sm:mt-0"
          checked={hideUnknownRecords}
          onChange={() => setHideUnknownRecords(!hideUnknownRecords)}
        />
      </div>

      {/* 取消註解以下區塊以恢復該設定項 */}
      {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 min-h-[45px] border-b border-gray-200">
        <div className="flex gap-2 items-center justify-center">
          <label>將地點加入收藏後從歷史紀錄中移除</label>
        </div>
        <input
          type="checkbox"
          className="w-4 h-4 cursor-pointer mt-2 sm:mt-0"
          checked={removeRecordAfterAddToFavorite}
          onChange={() =>
            setRemoveRecordAfterAddToFavorite(!removeRecordAfterAddToFavorite)
          }
        />
      </div> */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 min-h-[45px] border-b border-gray-200">
        <div className="flex gap-2 items-center justify-center">
          <label>無地址地點的地理位置查詢資料上限</label>
        </div>
        <input
          type="number"
          className="text-base w-[60px] px-2 text-center border border-gray-400 rounded-lg mt-2 sm:mt-0"
          value={skipFetchLocationInfo}
          onChange={(e) => setSkipFetchLocationInfo(Number(e.target.value))}
        />
      </div>

      <div className="flex justify-end">
        <button
          className="bg-slateBlue hover:bg-darkSlateBlue text-white px-4 py-2 rounded-lg"
          onClick={handleSaveSettings}
        >
          儲存設定
        </button>
      </div>
    </div>
  );
};
