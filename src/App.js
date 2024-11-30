import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import HomePage from './pages/HomePage';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import ApplicationForm from './pages/ApplicationForm';
import Admin from './pages/dashboards/Admin';
import Vro from './pages/dashboards/Vro';
import Mro from './pages/dashboards/Mro';
import Do from './pages/dashboards/Do';
import Mvro from './pages/dashboards/mvro';
import VRODashboard2 from './pages/users/svro/Dashboard';
import CompletedApplications from './pages/users/svro/Completed';
import Applications from './pages/users/svro/Applications';
import ApplicationForm2 from './pages/ApplicationForm2';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/application-form" element={<ApplicationForm/>} />
        <Route path="/admin" element={<Admin/>} />
        <Route path="/vro" element={<Vro/>} />
        <Route path="/mro" element={<Mro/>} />
        <Route path="/do" element={<Do/>} />
        <Route path="/svro2" element={<VRODashboard2/>} />
        <Route path="/svro2/Completed/" element={<CompletedApplications/>} />
        <Route path="/svro2/applications/" element={<Applications/>} />
        <Route path="/mvro" element={<Mvro/>} />
      </Routes>
    </Router>
  );
};

export default App;
