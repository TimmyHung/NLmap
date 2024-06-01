import { Link, useLocation, Outlet } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import css from "@/css/MainNavigation.module.css";
import logo from "@/assets/logo.png";
import { useAuth } from '@/components/lib/AuthProvider';
import Swal from 'sweetalert2';

export default function MainNavigation() {
  const { JWTtoken, username, role, logout } = useAuth();
  const location = useLocation();
  const currentPage = location.pathname;
  const isAdmin = role === "Admin";
  const [menuVisible, setMenuVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function temp() {
    Swal.fire({
      title: "Huh?",
      text: "這個按鈕要幹麻",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0ZQha6YdHqW2SKEFo9p2ltHvnDRIps-3w7Q7RAWEluw&s",
      imageWidth: 400,
      imageHeight: 200,
      imageAlt: "Custom image"
    });
  }

  function callProfile(){
    setMenuVisible(!menuVisible);
  }

  function callSetting(){
    Swal.fire({
      title: "別催了",
      text: "你要的設定介面在路上了",
      imageUrl: "https://i.pinimg.com/originals/94/4a/f9/944af92b1498751b005c6754aeac5f75.jpg",
      // imageWidth: 400,
      // imageHeight: 200,
      imageAlt: "Custom image"
    });
  }

  return (
    <>
      <div className={css.header}>
        <div className={css.leftContainer}>
          <div className={css.logo_section}>
            <Link to={"/"} className={css.logo_link}>
              <img className={css.logo} src={logo} alt="Logo" />
              <span>NLmap</span>
            </Link>
          </div>
          <div className={css.navBar}>
            <Link to="/">
              <button className={currentPage === '/' ? css.active : ''}>
                首頁
              </button>
            </Link>
            <Link to={JWTtoken ? "/history" : "/login"}>
              <button className={currentPage === '/history' ? css.active : ''}>
                歷史紀錄
              </button>
            </Link>
            <Link to={JWTtoken ? "/favorites" : "/login"}>
              <button className={currentPage === '/favorites' ? css.active : ''}>
                收藏
              </button>
            </Link>
            <Link to="/tutorial">
              <button className={currentPage === '/tutorial' ? css.active : ''}>
                使用教學
              </button>
            </Link>
            <Link to="/about">
              <button className={currentPage === '/about' ? css.active : ''}>
                關於我們
              </button>
            </Link>
            {isAdmin && (
              <Link to="/dashboard">
                <button className={currentPage === '/dashboard' ? css.active : ''}>
                  控制台
                </button>
              </Link>
            )}
          </div>
        </div>
        {JWTtoken ?
          <div className={css.profile} ref={menuRef}>
            <button className={css.profileButton} onClick={() => callProfile()}>
              <i className="fa-solid fa-user"></i>
            </button>
            {menuVisible && (
              <div className={css.dropdownMenu}>
                <span>歡迎回來，{username}！</span>
                <ul>
                  <li onClick={()=>callSetting()}><i className="fa-solid fa-gear"></i>設定</li>
                  <hr/>
                  <li onClick={()=>{logout("登出成功","");setMenuVisible(false);}}><i className="fa-solid fa-right-from-bracket"></i>登出</li>
                </ul>
              </div>
            )}
          </div>
          :
          <div className={css.authButtonContainer}>
            <Link to="/register">
              <button className={currentPage === '/register' ? css.active : ''}>
                註冊
              </button>
            </Link>
            |
            <Link to="/login">
              <button className={currentPage === '/login' ? css.active : ''}>
                登入
              </button>
            </Link>
          </div>
        }
      </div>
      <div className={css.outlet}>
        <Outlet />
      </div>
    </>
  );
}
