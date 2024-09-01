import { Link, useLocation, Outlet } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import SettingComponent from "@/components/layout/Setting";
import { useAuth } from '@/components/lib/AuthProvider';
import css from "@/css/MainNavigation.module.css";
import Swal from 'sweetalert2';
import logo from "@/assets/logo.png";

export default function MainNavigation() {
  const { JWTtoken, username, role, picture, logout } = useAuth();
  const location = useLocation();
  const currentPage = location.pathname;
  const isAdmin = role === "Admin";
  const [menuVisible, setMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [settingVisible, setSettingVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const settingRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const swalContainer = document.querySelector('.swal2-container');
      
      if (swalContainer && swalContainer.contains(event.target as Node)) {
        return;
      }
  
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuVisible(false);
      }
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setDrawerVisible(false);
      }
      if (settingRef.current && !settingRef.current.contains(event.target as Node)) {
        setSettingVisible(false);
      }
    }
  
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
  
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  

  const navLinks = [
    { to: "/", label: "首頁", icon: <i className="fa-solid fa-house"></i> },
    { to: JWTtoken ? "/history" : "/login", label: "歷史紀錄", icon: <i className="fa-solid fa-clock-rotate-left"></i>},
    { to: JWTtoken ? "/favorites" : "/login", label: "收藏", icon:  <i className="fa-solid fa-heart"></i>},
    { to: "/tutorial", label: "使用教學", icon: <i className="fa-solid fa-lightbulb"></i>},
    { to: "/about", label: "關於我們", icon: <i className="fa-solid fa-circle-info"></i> },
    { to: "/diary", label: "開發日誌", icon: <i className="fa-solid fa-book"></i>},
    { to: "/dashboard", label: "控制台", icon: <i className="fa-solid fa-hammer"></i>, private: true}
  ];


  function renderNavLinks() {
    return (
      <>
        {navLinks.map(link => {
          if (link.private && !isAdmin) {
            return null;
          }
          return (
            <Link key={link.label} to={link.to}>
              <button className={`${currentPage !== "/login" && currentPage === link.to ? 'bg-transparentGrey' : ''} text-gray-200 mx-1 bg-none border-none cursor-pointer h-8 md:px-[0.3vw] lg:px-4 hover:bg-transparentGrey`}>
                {link.label}
              </button>
            </Link>
          );
        })}
      </>
    );
  }
  
  function renderMobileNavLinks() {
    return (
      <>
        <ul className="list-none w-[calc(170px+10vw)] p-0 m-0 block">
          {navLinks.map(link => {
            if (link.private && !isAdmin) {
              return null;
            }
            return (
              <Link key={link.label} to={link.to}>
                <li className="flex p-3 cursor-pointer items-center m-2 text-white gap-2 hover:bg-gray-400 hover:rounded-lg">
                  {link.icon}{link.label}
                </li>
              </Link>
            );
          })}
          <hr className="mx-3" />
          {JWTtoken ? (
            <>
              <li className="flex p-3 cursor-pointer items-center m-2 text-white gap-2 hover:bg-transparentGrey hover:rounded-lg" onClick={() => setSettingVisible(true)}>
                <i className="fa-solid fa-gear"></i>設定
              </li>
              <li className="flex p-3 cursor-pointer items-center m-2 text-white gap-2 hover:bg-transparentGrey hover:rounded-lg" onClick={() => { logout("登出成功", ""); setMenuVisible(false); }}>
                <i className="fa-solid fa-right-from-bracket"></i>登出
              </li>
            </>
          ) : (
            <>
              <Link to="/register">
                <li className="flex p-3 cursor-pointer items-center m-2 text-white gap-2 hover:bg-transparentGrey hover:rounded-lg">
                  <i className="fa-solid fa-user-plus"></i>註冊
                </li>
              </Link>
              <Link to="/login">
                <li className="flex p-3 cursor-pointer items-center m-2 text-white gap-2 hover:bg-transparentGrey hover:rounded-lg">
                  <i className="fa-solid fa-right-to-bracket"></i>登入
                </li>
              </Link>
            </>
          )}
        </ul>
      </>
    );
  }
  
  return (
    <>
      <div className={`${css.headerContainer} flex justify-between items-center py-6 px-4 md:px-8 h-[9%] bg-[#202527] shadow-md`}>
        <div className="flex">
          <div className="transform scale-90 font-covered">
            <Link to="/" className="flex items-center text-center">
              <img className="w-12 h-auto mr-2.5" src={logo} alt="Logo" />
              <span className="text-4xl font-covered">NLmap</span>
            </Link>
          </div>
          <div className="hidden md:flex ml-[2vw] self-center pb-2 border-b border-white flex-nowrap overflow-x-auto whitespace-nowrap ">
            {renderNavLinks()}
          </div>
        </div>
        {JWTtoken ? (
          <div className="flex items-center">
            {!isMobile && (
              <div className="relative" ref={menuRef}>
                <button className="w-12 h-12 rounded-full border-none bg-black flex justify-center items-center cursor-pointer" onClick={() => setMenuVisible(!menuVisible)}>
                  {picture ? <img src={picture} alt="Profile" className="w-12 h-12 rounded-full object-cover" style={{ maxWidth: 'unset' }}/> : username?.charAt(0)}
                </button>
                {menuVisible && (
                  <div className="grid absolute mt-1.5 mr-5 right-0 bg-white shadow-lg rounded-lg z-50 self-center justify-center">
                    <span className="p-5 pt-5">歡迎回來，{username}！</span>
                    <ul className="list-none w-[15em] p-0 m-0 block">
                      <li className="flex p-3 cursor-pointer items-center m-2 gap-2 hover:bg-gray-300 hover:rounded-lg" onClick={() => setSettingVisible(true)}>
                        <i className="fa-solid fa-gear"></i>設定
                      </li>
                      <hr className="mx-3" />
                      <li className="flex p-3 cursor-pointer items-center m-2 gap-2 hover:bg-gray-300 hover:rounded-lg" onClick={() => { logout("登出成功", ""); setMenuVisible(false); }}>
                        <i className="fa-solid fa-right-from-bracket"></i>登出
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
            {isMobile && (
              <div>
                <button className="bg-none border-none text-white text-2xl cursor-pointer" onClick={() => setDrawerVisible(!drawerVisible)}>
                  <i className="fa-solid fa-bars"></i>
                </button>
                <div ref={drawerRef} className={ ` fixed inset-0 w-full h-full bg-black/40 flex justify z-[1000] ${drawerVisible ? '' : 'hidden'}`} onClick={() => setDrawerVisible(!drawerVisible)}>
                  <div className={` absolute right-0 top-0 h-full bg-[#343c3f] z-50 flex flex-col items-center pt-4 ${drawerVisible ? '' : 'hidden'}`}>
                    <div className="w-full flex flex-col items-center">
                      {renderMobileNavLinks()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {isMobile ? (
              <div>
                <button className="bg-none border-none text-white text-2xl cursor-pointer" onClick={() => setDrawerVisible(!drawerVisible)}>
                  <i className="fa-solid fa-bars"></i>
                </button>
                <div ref={drawerRef} className={ ` fixed inset-0 w-full h-full bg-black/40 flex justify z-[1000] ${drawerVisible ? '' : 'hidden'}`} onClick={() => setDrawerVisible(!drawerVisible)}>
                  <div className={` absolute right-0 top-0 h-full bg-[#343c3f] z-50 flex flex-col items-center pt-4 ${drawerVisible ? '' : 'hidden'}`}>
                    <div className="w-full flex flex-col items-center">
                      {renderMobileNavLinks()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="self-center rounded-lg bg-black/50 px-2 py-1 text-white flex flex-row items-center">
                <Link to="/register">
                  <button className={`${currentPage === '/register' ? 'bg-transparentGrey' : ''} px-3 hover:bg-transparentGrey whitespace-nowrap`}>
                    註冊
                  </button>
                </Link>
                <span className="px-2">|</span>
                <Link to="/login">
                  <button className={`${currentPage === '/login' ? 'bg-transparentGrey' : ''} px-3 hover:bg-transparentGrey whitespace-nowrap`}>
                    登入
                  </button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
      <div className="h-bodyFull">
        <Outlet />
      </div>
      {settingVisible && (
        <div className="fixed inset-0 w-full h-full bg-black/40 flex justify-center items-center z-[1000]">
          <div className="bg-white flex justify-center items-center rounded-lg shadow-lg" ref={settingRef}>
            <SettingComponent setSettingVisible={setSettingVisible}/>
          </div>
        </div>
      )}
    </>
  );  
}