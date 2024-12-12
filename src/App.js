import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Public Pages
import HomePage from './pages/HomePage';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import ContactUs from './pages/ContactUs';

// Applicant Pages
import ApplicantDashboard from './pages/users/applicant/Dashboard';
import ApplicationForm from './pages/users/applicant/ApplicationForm';
import MyApplications from './pages/users/applicant/MyApplications';
import ApplicationStatus from './pages/users/applicant/ApplicationStatus';
import Report from './pages/users/applicant/Report';
import RenewCertificate from './pages/users/applicant/RenewCertificate';

// Admin Pages
import Admin from './pages/dashboards/Admin';

// MVRO pages
import PendingApplicationsMVRO from './pages/users/mvro/PendingApplications';
import CompletedApplicationsMVRO from './pages/users/mvro/Completed';
import ApplicationsMVRO from './pages/users/mvro/Applications';
import MyReportsMVRO from './pages/users/mvro/MyReports';
import MVRODashboard from './pages/users/mvro/Dashboard';

// VRO Pages
import Vro from './pages/dashboards/Vro';
import VRODashboard2 from './pages/users/svro/Dashboard';
import CompletedApplications from './pages/users/svro/Completed';
import PendingApplications from './pages/users/svro/PendingApplications';
import ResentApplications from './pages/users/svro/ResentApplications';
import Applications from './pages/users/svro/Applications';
import MyReports from './pages/users/svro/MyReports';
import ScheduleApplications from './pages/users/svro/ScheduleApplications';


// Ri pages
import ApplicationsRi from './pages/users/ri/Applications';
import RIDashboard from './pages/users/ri/Dashboard';
import CompletedApplicationsRI from './pages/users/ri/Completed';
import PendingApplicationsRI from './pages/users/ri/Pending';
import RIReports from './pages/users/ri/MyReports';
import ReadyToReviewRI from './pages/users/ri/ReadyToReview';

// MRO Pages
import MRODashboard from './pages/users/mro/Dashboard';
import ApplicationsMro from './pages/users/mro/Applications';
import MROMyReports from './pages/users/mro/MyReports';
import PendingApplicationsMRO from './pages/users/mro/PendingApplications';
import CompletedApplicationsMRO from './pages/users/mro/Completed';
import Do from './pages/dashboards/Do';
import ScheduleApplicationsMro from './pages/users/mro/ScheduleApplications';


// import MRODashboard from './pages/dashboards/Mro';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/contactus" element={<ContactUs />} />

        {/* Applicant Routes */}
        <Route path="/applicant" element={<ApplicantDashboard />} />
        <Route path="/applicant/new-application" element={<ApplicationForm />} />
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

        {/* MVRO Routes */}
        <Route path="/mvro" element={<MVRODashboard />} />
        <Route path="/mvro/applications" element={<ApplicationsMVRO />} />
        <Route path="/mvro/pending" element={<PendingApplicationsMVRO />} />
        <Route path="/mvro/completed" element={<CompletedApplicationsMVRO />} />
        <Route path="/mvro/reports" element={<MyReportsMVRO />} />

        {/* RI Routes */}
        {/* <Route path="/ri" element={<RiDashboard />} /> */}
        <Route path="/ri/Applications" element={<ApplicationsRi />} />
        <Route path="/ri" element={<RIDashboard />} />
        <Route path="/ri/completed" element={<CompletedApplicationsRI />} />
        <Route path="/ri/pending" element={<PendingApplicationsRI />} />
        <Route path="/ri/ready_to_review" element={<ReadyToReviewRI />} />
        <Route path="/ri/reports" element={<RIReports />} />


        {/* MRO Routes */}
        {/* <Route path="/mro" element={<MRODashboard />} /> */}
        <Route path="/mro" element={<MRODashboard />} />
        <Route path="/mro/Applications" element={<ApplicationsMro />} />
        <Route path="/mro/pending" element={<PendingApplicationsMRO />} />
        <Route path='/mro/completed' element={<CompletedApplicationsMRO />} />
        <Route path="/mro/reports" element={<MROMyReports />} />
        <Route path="/mro/schedule" element={<ScheduleApplicationsMro />} />




        {/* DO Routes */}
        <Route path="/do" element={<Do />} />
      </Routes>
    </Router>
  );
};

export default App;