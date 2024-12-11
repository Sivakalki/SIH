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
import RenewCertificate from './pages/users/applicant/RenewCertificate';

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
import PendingApplicationsMVRO from './pages/users/mvro/PendingApplications';
import CompletedApplicationsMVRO from './pages/users/mvro/Completed';


// Ri pages
import ApplicationsRi from './pages/users/ri/Applications';
import RIDashboard from './pages/users/ri/Dashboard';
import CompletedApplicationsRI from './pages/users/ri/Completed';
import PendingApplicationsRI from './pages/users/ri/Pending';

// MRO Pages
import Mro from './pages/dashboards/Mro';
import MVRODashboard from './pages/users/mvro/Dashboard';
import ApplicationsMvro from './pages/users/mvro/Applications';
import MVROMyReports from './pages/users/mvro/MyReports';

// DO Pages
import Do from './pages/dashboards/Do';
import ReadyToReviewRI from './pages/users/ri/ReadyToReview';
import ApplicationForm2 from './pages/users/applicant/ApplicationForm2';

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
        <Route path="/applicant/new-application2" element={<ApplicationForm2 />} />
        <Route path="/applicant/applications" element={<MyApplications />} />
        <Route path="/applicant/status" element={<ApplicationStatus />} />
        <Route path="/applicant/reports" element={<Report />} />
        <Route path="/applicant/renewal" element={<RenewCertificate />} />

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

        {/* RI Routes */}
        {/* <Route path="/ri" element={<RiDashboard />} /> */}
        <Route path="/ri/Applications" element={<ApplicationsRi />} />
        <Route path="/ri" element={<RIDashboard />} />
        <Route path="/ri/completed" element={<CompletedApplicationsRI />} />
        <Route path="/ri/pending" element={<PendingApplicationsRI />} />
        <Route path="/ri/ready_to_review" element={<ReadyToReviewRI />} />

        {/* MRO Routes */}
        <Route path="/mro" element={<Mro />} />
        <Route path="/mvro" element={<MVRODashboard />} />
        <Route path="/mvro/Applications" element={<ApplicationsMvro />} />
        <Route path="/mvro/pending" element={<PendingApplicationsMVRO />} />
        <Route path='/mvro/completed' element={<CompletedApplicationsMVRO />} />
        <Route path="/mvro/reports" element={<MVROMyReports />} />



        {/* DO Routes */}
        <Route path="/do" element={<Do />} />
      </Routes>
    </Router>
  );
};

export default App;
