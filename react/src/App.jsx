import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/utils/AuthProvider';
import { verifyJWT } from './components/utils/API'

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashBoard from './pages/DashBoard';
import NotFound from './pages/NotFound';

import MainNavigation from './components/layout/MainNavigation';


export default function App() {

  return (
    <>
      <AuthProvider>
        <BrowserRouter>
            <Routes>
              {/* Main-Navigation */}
              <Route element={<MainNavigation/>}>
                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />}/>
                <Route path="/register" element={<Register />}/>

                <Route element={<PrivateRoute requiredRoles={['Admin']} />}>
                  <Route path="/dashboard" element={<DashBoard />} />
                </Route>

                <Route path="/404" element={<NotFound />} />
                {/* <Route path="*" element={<NotFound />} /> */}
              </Route>
              {/* No-Navigation */}
            </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}


function PrivateRoute(props) {
  const { requiredRoles } = props;
  const { JWTtoken } = useAuth();
  const [authorizedComponent, setAuthorizedComponent] = useState(null);
  
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
      }else{
        const userRole = response.data.role;
        const authorized = requiredRoles.some(role => userRole.includes(role));
        authorized ? setAuthorizedComponent(<Outlet />) : setAuthorizedComponent(<iNavgate to="/404" />);
      }

    }

    check();
  }, [JWTtoken, requiredRoles]);

  return authorizedComponent;
}

