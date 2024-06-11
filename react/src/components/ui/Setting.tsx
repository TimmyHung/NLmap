import React, { useState } from 'react';
import css from '@/css/Setting.module.css';

interface disableSetting {
    setSettingVisible: (response: any) => void;
}

const SettingComponent: React.FC<disableSetting> = ({setSettingVisible}) => {
    const [selectedTab, setSelectedTab] = useState('general');

    const handleTabClick = (tab: string) => {
        setSelectedTab(tab);
        console.log(selectedTab)
    };

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
