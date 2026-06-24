import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// PAGES
import Home from '../pages/Home';

// ROUTES KONVENSIONAL
import Login from '../pages/konvensional/Login';
import Register from '../pages/konvensional/Register';
import Dashboard from '../pages/konvensional/Dashboard';

// ROUTES ZKP
import ZkpLogin from '../pages/zkp/Login';
import ZkpRegister from '../pages/zkp/Register';
import ZkpDashboard from '../pages/zkp/Dashboard';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* ROUTES KONVENSIONAL */}
        <Route path="/konvensional/login" element={<Login />} />
        <Route path="/konvensional/register" element={<Register />} />
        <Route path="/konvensional/dashboard" element={<Dashboard />} />

        {/* ROUTES ZKP */}
        <Route path="/zkp/login" element={<ZkpLogin />} />
        <Route path="/zkp/register" element={<ZkpRegister />} />
        <Route path="/zkp/dashboard" element={<ZkpDashboard />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
