import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import HomePage from './pages/HomePage';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import ApplicationForm from './pages/ApplicationForm';
import Admin from './pages/dashboards/Admin';
import Vro from './pages/dashboards/Vro';
import Mro from './pages/dashboards/Mro';
import Do from './pages/dashboards/Do'

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
      </Routes>
    </Router>
  );
};

export default App;
