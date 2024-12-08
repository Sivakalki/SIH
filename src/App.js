import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Public Pages
import HomePage from './pages/HomePage';
import SignUp from './pages/SignUp';
import Login from './pages/Login';

// Applicant Pages
import ApplicantDashboard from './pages/users/applicant/Dashboard';
import ApplicationForm from './pages/users/applicant/ApplicationForm';
import MyApplications from './pages/users/applicant/MyApplications';
import ApplicationStatus from './pages/users/applicant/ApplicationStatus';
import Report from './pages/users/applicant/Report';

// Admin Pages
import Admin from './pages/dashboards/Admin';

// VRO Pages
import Vro from './pages/dashboards/Vro';
import VRODashboard2 from './pages/users/svro/Dashboard';
import CompletedApplications from './pages/users/svro/Completed';
import PendingApplications from './pages/users/svro/PendingApplications';
import ResentApplications from './pages/users/svro/ResentApplications';
import Applications from './pages/users/svro/Applications';
import MyReports from './pages/users/svro/MyReports';
import ScheduleApplications from './pages/users/svro/ScheduleApplications';

// MRO Pages
import Mro from './pages/dashboards/Mro';
import MVRODashboard from './pages/users/mvro/Dashboard';
import ApplicationsMvro from './pages/users/mvro/Applications';
import MVROMyReports from './pages/users/mvro/MyReports';

// DO Pages
import Do from './pages/dashboards/Do';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Applicant Routes */}
        <Route path="/applicant" element={<ApplicantDashboard />} />
        <Route path="/applicant/new-application" element={<ApplicationForm />} />
        <Route path="/applicant/applications" element={<MyApplications />} />
        <Route path="/applicant/status" element={<ApplicationStatus />} />
        <Route path="/applicant/reports" element={<Report />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Admin />} />

        {/* VRO Routes */}
        <Route path="/vro" element={<Vro />} />
        <Route path="/svro" element={<VRODashboard2 />} />
        <Route path="/svro/applications" element={<Applications />} />
        <Route path="/svro/pending" element={<PendingApplications />} />
        <Route path="/svro/schedule" element={<ScheduleApplications />} />
        <Route path="/svro/completed" element={<CompletedApplications />} />
        <Route path="/svro/Resent" element={<ResentApplications />} />
        <Route path="/svro/reports" element={<MyReports />} />

        {/* MRO Routes */}
        <Route path="/mro" element={<Mro />} />
        <Route path="/mvro" element={<MVRODashboard />} />
        <Route path="/mvro/Applications" element={<ApplicationsMvro />} />
        <Route path="/mvro/myReports" element={<MVROMyReports />} />

        {/* DO Routes */}
        <Route path="/do" element={<Do />} />
      </Routes>
    </Router>
  );
};

export default App;
