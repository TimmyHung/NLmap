import { useState, useEffect, ReactElement } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/components/lib/AuthProvider';
import { verifyJWT } from '@/components/lib/API';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider } from 'react-redux';
import store from './store';

import Home from '@/pages/Home';
import Tutorial from '@/pages/Tutorial';
import History from '@/pages/History';
import Favorite from '@/pages/Favorite';
import About from '@/pages/About';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import DashBoard from '@/pages/DashBoard';
import NotFound from '@/pages/NotFound';
import Diary from '@/pages/Diary';

import MainNavigation from '@/components/layout/MainNavigation';

export default function App(): ReactElement {
  return (
    <GoogleOAuthProvider clientId="511179737777-0cqaobrr6a2pp8nuf3jphdkoj2p7jg80.apps.googleusercontent.com">
      <BrowserRouter>
        <AuthProvider>
          <Provider store={store}>
              <Routes>
                <Route element={<MainNavigation />}>
                  <Route path="/" element={<Home />} />
                  <Route element={<PrivateRoute requiredRoles={['User','Admin']} />}>
                    <Route path="/history" element={<History />} />
                  </Route>
                  <Route element={<PrivateRoute requiredRoles={['User','Admin']} />}>
                    <Route path="/favorites" element={<Favorite />} />
                  </Route>
                  <Route path="/tutorial" element={<Tutorial />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/diary" element={<Diary />} />
                  <Route element={<PrivateRoute requiredRoles={['Admin']} />}>
                    <Route path="/dashboard" element={<DashBoard />} />
                  </Route>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
          </Provider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}


interface PrivateRouteProps {
  requiredRoles: string[];
}

function PrivateRoute(props: PrivateRouteProps): ReactElement | null {
  const { requiredRoles } = props;
  const { JWTtoken } = useAuth();
  const [authorizedComponent, setAuthorizedComponent] = useState<ReactElement | null>(null);

  useEffect(() => {
    async function check() {
      if (!JWTtoken) {
        setAuthorizedComponent(<Navigate to="/login" />);
        return;
      }

      const response = await verifyJWT(JWTtoken);
      if (!response.status) {
        setAuthorizedComponent(<Navigate to="/login" />);
        return;
      } else {
        const userRole = response.data.role;
        const authorized = requiredRoles.some(role => userRole.includes(role));
        authorized ? setAuthorizedComponent(<Outlet />) : setAuthorizedComponent(<Navigate to="/404" />);
      }
    }

    check();
  }, [JWTtoken, requiredRoles]);

  return authorizedComponent;
}
