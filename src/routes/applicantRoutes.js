import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from '../pages/users/applicant/Dashboard';
import ApplicationForm from '../pages/users/applicant/ApplicationForm';
import MyApplications from '../pages/users/applicant/MyApplications';
import ApplicationStatus from '../pages/users/applicant/ApplicationStatus';
import Report from '../pages/users/applicant/Report';

const ApplicantRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/new-application" element={<ApplicationForm />} />
      <Route path="/applications" element={<MyApplications />} />
      <Route path="/status" element={<ApplicationStatus />} />
      <Route path="/reports" element={<Report />} />
      <Route path="*" element={<Navigate to="/applicant" replace />} />
    </Routes>
  );
};

export default ApplicantRoutes;
