import React, { useState } from 'react';
import { useAuth } from '@/components/lib/AuthProvider';
import { deleteRequest } from '@/components/lib/API';
import css from '@/css/Setting.module.css';
import Swal from 'sweetalert2';

interface disableSetting {
    setSettingVisible: (response: any) => void;
}

const SettingComponent: React.FC<disableSetting> = ({setSettingVisible}) => {
    const [selectedTab, setSelectedTab] = useState('general');
    const { JWTtoken, account_type, userID } = useAuth();
    const { logout } = useAuth();

    const handleTabClick = (tab: string) => {
        setSelectedTab(tab);
    };

    function deleteAccount(){
        Swal.fire({
            title: "確定要刪除帳號嗎?",
            text: "這項動作不可復原",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "是的，請刪除！",
            cancelButtonText: "我再考慮一下"
          }).then(async (result) => {
            if (result.isConfirmed) {
                const data = {
                    JWTtoken: JWTtoken,
                    account_type: account_type,
                    userID: userID
                }
                const response = await deleteRequest('api/authorization/delete', data);
                if(response.status){
                    logout("帳號已刪除","您以被強制登出")
                    setSettingVisible(false);
                }else{
                    Swal.fire({
                        icon: "error",
                        title: "帳號刪除失敗",
                        text: response.message,
                        footer: '如果你認為這是一項錯誤，請聯絡網站管理員。',
                        showConfirmButton: false,
                        showCloseButton: true
                    });
                }
            }
          });
    }

    return (
        <div className={css.settingsContainer}>
            <div className={css.titleContainer}>
                <span>設定</span>
                <button onClick={()=>setSettingVisible(false)}><i className="fa-solid fa-xmark fa-lg"></i></button>
            </div>
            <div className={css.settingbody}>
                <div className={css.settingsSidebar}>
                    <ul>
                        <li className={selectedTab === 'general' ? css.active : ''} onClick={() => handleTabClick('general')}><i className="fa-solid fa-gear"></i>一般</li>
                        <li className={selectedTab === 'data' ? css.active : ''} onClick={() => handleTabClick('data')}><i className="fa-solid fa-database"></i>資料</li>
                        <li className={selectedTab === 'meow' ? css.active : ''} onClick={() => handleTabClick('meow')}><i className="fa-solid fa-paw"></i>???</li>
                    </ul>
                </div>
                <div className={css.settingsContent}>
                    {selectedTab === 'general' && (
                        <div>
                            <div className={css.settingRow}>
                                <label>第一列設定行</label>
                                <input type="checkbox" />
                            </div>
                            <div className={css.settingRow}>
                                <label>第二列設定行</label>
                                <input type="checkbox" />
                            </div>
                        </div>
                    )}
                    {selectedTab === 'data' && (
                        <div>
                            <h2>資料</h2>
                            <button className={css.deleteButton} onClick={()=>{deleteAccount()}}>刪除帳號</button>
                        </div>
                    )}
                    {selectedTab === 'meow' && (
                        <div>
                            <h2>???</h2>
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVcAgf-B5V5IOXEijtVJtjwhuOMPvzi3ctrw&s"></img>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingComponent;
