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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuVisible(false);
      }
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setDrawerOpen(false);
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
    { to: "/dashboard", label: "控制台", icon: <i className="fa-solid fa-hammer"></i>, private: true}
  ];

  function handleButtonClick(label: string, imageUrl: string) {
    Swal.fire({
      title: label,
      imageUrl: imageUrl,
      imageAlt: "Custom image"
    });
  }

  function renderNavLinks() {
    return (
      <>
          {navLinks.map(link => {
            if (link.private && !isAdmin) {
              return null;
            }
            return (
              <Link key={link.label} to={link.to}>
                <button className={currentPage != "/login" && currentPage === link.to ? css.active : ''}>
                  {link.label}
                </button>
              </Link>
            )
          }
        )}
      </>
    );
  }
  function renderMobileNavLinks() {
    return (
      <>
        <ul>
          {navLinks.map(link => {
            if (link.private && !isAdmin) {
              return null;
            }
            return (
              <Link key={link.to} to={link.to}>
                <li>
                      {link.icon}{link.label}
                </li>
              </Link>
            );
          })}
          <hr />
          <li onClick={() => { handleButtonClick("別催了", "https://i.pinimg.com/originals/94/4a/f9/944af92b1498751b005c6754aeac5f75.jpg"); }}>
            <i className="fa-solid fa-gear"></i>設定
          </li>
          <li onClick={() => { logout("登出成功", ""); setMenuVisible(false); }}>
            <i className="fa-solid fa-right-from-bracket"></i>登出
          </li>
        </ul>
      </>
    );
  }

  return (
    <>
      <div className={css.header}>
        <div className={css.leftContainer}>
          <div className={css.logo_section}>
            <Link to="/" className={css.logo_link}>
              <img className={css.logo} src={logo} alt="Logo" />
              <span>NLmap</span>
            </Link>
          </div>
          <div className={css.navBar} style={{ display: isMobile ? 'none' : 'flex' }}>
            {renderNavLinks()}
          </div>
        </div>
        {JWTtoken ? (
          <div className={css.profileContainer}>
            {!isMobile && (
              <div className={css.profile} ref={menuRef}>
                <button className={css.profileButton} onClick={()=>setMenuVisible(!menuVisible)}>
                  {username?.charAt(0)}
                </button>
                {menuVisible && (
                  <div className={css.dropdownMenu}>
                    <span>歡迎回來，{username}！</span>
                    <ul>
                      <li onClick={() => handleButtonClick("別催了", "https://i.pinimg.com/originals/94/4a/f9/944af92b1498751b005c6754aeac5f75.jpg")}>
                        <i className="fa-solid fa-gear"></i>設定
                      </li>
                      <hr />
                      <li onClick={() => { logout("登出成功", ""); setMenuVisible(false); }}>
                        <i className="fa-solid fa-right-from-bracket"></i>登出
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
            {isMobile && (
              <div ref={drawerRef}>
                <button className={css.drawerButton} onClick={() => setDrawerOpen(!drawerOpen)}>
                  <i className="fa-solid fa-bars"></i>
                </button>
                <div className={`${css.drawer} ${drawerOpen ? css.drawerOpen : ''}`} >
                  <div className={css.drawerContent}>
                    {renderMobileNavLinks()}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
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
        )}
      </div>
      <div className={css.outlet}>
        <Outlet />
      </div>
    </>
  );
}
