import { Link, useLocation, Outlet, ReactElement } from "react-router-dom";
import css from "@/css/MainNavigation.module.css";
import logo from "@/assets/logo.png";
import { useAuth } from '@/components/lib/AuthProvider';
import Swal from 'sweetalert2';

export default function MainNavigation(): ReactElement {
  const { JWTtoken, username, role, logout } = useAuth();
  const location = useLocation();
  const currentPage = location.pathname;
  const isAdmin = role === "Admin";

  const pageTitles: { [key: string]: string } = {
    '/': '首頁',
    '/login': '登入',
    '/register': '註冊',
    '/recover': '帳號救援',
    '/dashboard': '控制台',
    '/404': '404',
  };
  const pageTitle = pageTitles[currentPage] || '404';

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
        <div className={css.logo_section}>
          <Link to={"/"} className={css.logo_link}>
            <img className={css.logo} src={logo} alt="Logo" />
            <span>OverPassNL</span>
          </Link>
        </div>
        <nav>
          <ul>
            <li>
              {JWTtoken && <div className={css.welcome}>歡迎回來 <span>{username}</span></div>}
            </li>
            {!["/login", "/register"].includes(currentPage) && (
              <>
                <li>
                  {isAdmin && (["/dashboard"].includes(currentPage) ? <Link to="/"><button>首頁</button></Link> : <Link to="/dashboard"><button>控制台</button></Link>)}
                </li>
                <li>
                  {JWTtoken ?
                    <Link to="/">
                      <button onClick={() => logout("登出成功", null)}>登出</button>
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
