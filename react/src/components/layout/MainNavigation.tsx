import { Link, useLocation, Outlet } from "react-router-dom";
import css from "@/css/MainNavigation.module.css";
import logo from "@/assets/logo.png";
import { useAuth } from '@/components/lib/AuthProvider';
import Swal from 'sweetalert2';

export default function MainNavigation() {
  const { JWTtoken, username, role, logout } = useAuth();
  const location = useLocation();
  const currentPage = location.pathname;
  const isAdmin = role === "Admin";

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
            <Link to="/history">
              <button className={currentPage === '/history' ? css.active : ''}>
                歷史紀錄
              </button>
            </Link>
            <Link to="/favorites">
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
        <nav>
          <ul>
            {!["/login", "/register"].includes(currentPage) && (
              <>
                <li>
                  {isAdmin && (["/dashboard"].includes(currentPage) ? <Link to="/"><button>首頁</button></Link> : <Link to="/dashboard"><button>控制台</button></Link>)}
                </li>
                <li>
                  {JWTtoken ?
                    <Link to="/">
                      <button onClick={() => logout("登出成功", "")}>登出</button>
                    </Link>
                    :
                    <Link to="/login">
                      <button>登入</button>
                    </Link>
                  }
                </li>
                <li>
                  <button onClick={() => temp()}><i className="fa-solid fa-bars"></i></button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
      <div className={css.outlet}>
        <Outlet />
      </div>
    </>
  );
}
