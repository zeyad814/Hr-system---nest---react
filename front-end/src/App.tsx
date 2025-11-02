import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { DepartmentsProvider } from "@/contexts/DepartmentsContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Import pages
import HomePage from "@/pages/Index";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Partners from "@/pages/Partners";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminClients from "@/pages/admin/Clients";
import AdminUsers from "@/pages/admin/Users";
import AdminContracts from "@/pages/admin/Contracts";
import AdminReports from "@/pages/admin/Reports";
import AdminSettings from "@/pages/admin/Settings";
import ClientDetail from "@/pages/admin/ClientDetail";
import AdminProfile from "@/pages/admin/Profile";
import AdminJobs from "@/pages/admin/Jobs";
import AdminJobDetails from "@/pages/admin/JobDetails";
import AdminApplicantProfile from "@/pages/admin/ApplicantProfile";
import MonthlyTargets from "@/pages/admin/MonthlyTargets";
import SkillPackages from "@/pages/admin/SkillPackages";
import InterviewScheduler from "@/pages/admin/InterviewScheduler";
import RevenueReport from "@/pages/admin/RevenueReport";
import JobStatusReport from "@/pages/admin/JobStatusReport";
import ContractsReport from "@/pages/admin/ContractsReport";
import JobsReport from "@/pages/admin/JobsReport";
import ApplicantsReport from "@/pages/admin/ApplicantsReport";
import ClientStatusReport from "@/pages/admin/ClientStatusReport";
import ClientActivityReport from "@/pages/admin/ClientActivityReport";
import OverallPerformanceReport from "@/pages/admin/OverallPerformanceReport";
import TargetProgressReport from "@/pages/admin/TargetProgressReport";

// HR pages
import HRDashboard from "@/pages/hr/HRDashboard";
import HRJobs from "@/pages/hr/Jobs";
import HRCandidates from "@/pages/hr/Candidates";
import HRCandidateProfile from "@/pages/hr/CandidateProfile";
import HRInterviews from "@/pages/hr/Interviews";
import HRReports from "@/pages/hr/Reports";
import HRProfile from "@/pages/hr/Profile";
import HRSettings from "@/pages/hr/HRSettings";
import HRSkillPackages from "@/pages/hr/SkillPackages";
import HRContracts from "@/pages/hr/HRContracts";

// Sales pages
import SalesDashboard from "@/pages/sales/SalesDashboard";
import SalesClients from "@/pages/sales/SalesClients";
import SalesJobs from "@/pages/sales/SalesJobs";
import SalesContracts from "@/pages/sales/SalesContracts";
import SalesRevenue from "@/pages/sales/Revenue";
import SalesTargets from "@/pages/sales/Targets";
import SalesReminders from "@/pages/sales/SalesReminders";
import SalesArchive from "@/pages/sales/SalesArchive";
import SalesReports from "@/pages/sales/SalesReports";
import SalesProfile from "@/pages/sales/Profile";
import SalesSettings from "@/pages/sales/SalesSettings";
import SalesCandidates from "@/pages/sales/SalesCandidates";
import SalesOffersReview from "@/pages/sales/SalesOffersReview";

// Client pages
import ClientDashboard from "@/pages/client/ClientDashboard";
import ClientJobs from "@/pages/client/ClientJobs";
import ClientCandidates from "@/pages/client/ClientCandidates";
import ClientContracts from "@/pages/client/Contracts";
import RequestJob from "@/pages/client/RequestJob";
import ClientDepartments from "@/pages/client/Departments";
import ClientLocations from "@/pages/client/Locations";
import TestPage from "@/pages/client/TestPage";
import ClientProfile from "@/pages/client/ClientProfile";
import ClientSettings from "@/pages/client/ClientSettings";

// Applicant pages
import ApplicantDashboard from "@/pages/applicant/ApplicantDashboard";
import ApplicantJobs from "@/pages/applicant/ApplicantJobs";
import JobDetails from "@/pages/applicant/JobDetails";
import ApplicantInterviews from "@/pages/applicant/ApplicantInterviews";
import ApplicantApplications from "@/pages/applicant/ApplicantApplications";
import ApplicantContracts from "@/pages/applicant/ApplicantContracts";
import ApplicantProfile from "@/pages/applicant/ApplicantProfile";
import ApplicantSettings from "@/pages/applicant/ApplicantSettings";
import ApplicationTimeline from "@/pages/applicant/ApplicationTimeline";

// Other pages
import NotFound from "@/pages/NotFound";
import WhatsAppIntegration from "@/pages/WhatsAppIntegration";
import ContractManagement from "@/pages/ContractManagement";
import CandidateTimeline from "@/pages/CandidateTimeline";

function App() {
  return (
    <AuthProvider>
      <DepartmentsProvider>
        <div className="min-h-screen bg-background">
          <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/clients" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminClients /></ProtectedRoute>} />
        <Route path="/admin/clients/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><ClientDetail /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/contracts" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminContracts /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/reports/revenue" element={<ProtectedRoute allowedRoles={['ADMIN']}><RevenueReport /></ProtectedRoute>} />
        <Route path="/admin/reports/jobs" element={<ProtectedRoute allowedRoles={['ADMIN']}><JobStatusReport /></ProtectedRoute>} />
        <Route path="/admin/reports/contracts" element={<ProtectedRoute allowedRoles={['ADMIN']}><ContractsReport /></ProtectedRoute>} />
        <Route path="/admin/reports/jobs-list" element={<ProtectedRoute allowedRoles={['ADMIN']}><JobsReport /></ProtectedRoute>} />
        <Route path="/admin/reports/applicants" element={<ProtectedRoute allowedRoles={['ADMIN']}><ApplicantsReport /></ProtectedRoute>} />
        <Route path="/admin/reports/client-status" element={<ProtectedRoute allowedRoles={['ADMIN']}><ClientStatusReport /></ProtectedRoute>} />
        <Route path="/admin/reports/client-activity" element={<ProtectedRoute allowedRoles={['ADMIN']}><ClientActivityReport /></ProtectedRoute>} />
        <Route path="/admin/reports/overall" element={<ProtectedRoute allowedRoles={['ADMIN']}><OverallPerformanceReport /></ProtectedRoute>} />
        <Route path="/admin/reports/targets" element={<ProtectedRoute allowedRoles={['ADMIN']}><TargetProgressReport /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSettings /></ProtectedRoute>} />
        <Route path="/admin/monthly-targets" element={<ProtectedRoute allowedRoles={['ADMIN']}><MonthlyTargets /></ProtectedRoute>} />
        <Route path="/admin/skill-packages" element={<ProtectedRoute allowedRoles={['ADMIN']}><SkillPackages /></ProtectedRoute>} />
        <Route path="/admin/interviews" element={<ProtectedRoute allowedRoles={['ADMIN']}><InterviewScheduler /></ProtectedRoute>} />
        <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminProfile /></ProtectedRoute>} />
        <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminJobs /></ProtectedRoute>} />
        <Route path="/admin/jobs/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminJobDetails /></ProtectedRoute>} />
        <Route path="/admin/applicants/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminApplicantProfile /></ProtectedRoute>} />
        
        {/* HR routes */}
        <Route path="/hr" element={<ProtectedRoute allowedRoles={['HR']}><HRDashboard /></ProtectedRoute>} />
        <Route path="/hr/jobs" element={<ProtectedRoute allowedRoles={['HR']}><HRJobs /></ProtectedRoute>} />
        <Route path="/hr/candidates" element={<ProtectedRoute allowedRoles={['HR']}><HRCandidates /></ProtectedRoute>} />
        <Route path="/hr/candidates/:id" element={<ProtectedRoute allowedRoles={['HR']}><HRCandidateProfile /></ProtectedRoute>} />
        <Route path="/hr/interviews" element={<ProtectedRoute allowedRoles={['HR']}><HRInterviews /></ProtectedRoute>} />
        <Route path="/hr/reports" element={<ProtectedRoute allowedRoles={['HR']}><HRReports /></ProtectedRoute>} />
        <Route path="/hr/skill-packages" element={<ProtectedRoute allowedRoles={['HR']}><HRSkillPackages /></ProtectedRoute>} />
        <Route path="/hr/contracts" element={<ProtectedRoute allowedRoles={['HR']}><HRContracts /></ProtectedRoute>} />
        <Route path="/hr/profile" element={<ProtectedRoute allowedRoles={['HR']}><HRProfile /></ProtectedRoute>} />
        <Route path="/hr/settings" element={<ProtectedRoute allowedRoles={['HR']}><HRSettings /></ProtectedRoute>} />
        
        {/* Sales routes */}
        <Route path="/sales" element={<ProtectedRoute allowedRoles={['SALES']}><SalesDashboard /></ProtectedRoute>} />
        <Route path="/sales/clients" element={<ProtectedRoute allowedRoles={['SALES']}><SalesClients /></ProtectedRoute>} />
        <Route path="/sales/jobs" element={<ProtectedRoute allowedRoles={['SALES']}><SalesJobs /></ProtectedRoute>} />
        <Route path="/sales/contracts" element={<ProtectedRoute allowedRoles={['SALES']}><SalesContracts /></ProtectedRoute>} />
        <Route path="/sales/candidates" element={<ProtectedRoute allowedRoles={['SALES']}><SalesCandidates /></ProtectedRoute>} />
        <Route path="/sales/offers-review" element={<ProtectedRoute allowedRoles={['SALES']}><SalesOffersReview /></ProtectedRoute>} />
        <Route path="/sales/revenue" element={<ProtectedRoute allowedRoles={['SALES']}><SalesRevenue /></ProtectedRoute>} />
        <Route path="/sales/targets" element={<ProtectedRoute allowedRoles={['SALES']}><SalesTargets /></ProtectedRoute>} />
        <Route path="/sales/reminders" element={<ProtectedRoute allowedRoles={['SALES']}><SalesReminders /></ProtectedRoute>} />
        <Route path="/sales/archive" element={<ProtectedRoute allowedRoles={['SALES']}><SalesArchive /></ProtectedRoute>} />
        <Route path="/sales/reports" element={<ProtectedRoute allowedRoles={['SALES']}><SalesReports /></ProtectedRoute>} />
        <Route path="/sales/profile" element={<ProtectedRoute allowedRoles={['SALES']}><SalesProfile /></ProtectedRoute>} />
        <Route path="/sales/settings" element={<ProtectedRoute allowedRoles={['SALES']}><SalesSettings /></ProtectedRoute>} />
        
        {/* Client routes */}
        <Route path="/client" element={<ProtectedRoute allowedRoles={['CLIENT']}><ClientDashboard /></ProtectedRoute>} />
        <Route path="/client/jobs" element={<ProtectedRoute allowedRoles={['CLIENT']}><ClientJobs /></ProtectedRoute>} />
        <Route path="/client/candidates" element={<ProtectedRoute allowedRoles={['CLIENT']}><ClientCandidates /></ProtectedRoute>} />
        <Route path="/client/contracts" element={<ProtectedRoute allowedRoles={['CLIENT']}><ClientContracts /></ProtectedRoute>} />
        <Route path="/client/request-job" element={<ProtectedRoute allowedRoles={['CLIENT']}><RequestJob /></ProtectedRoute>} />
        <Route path="/client/departments" element={<ProtectedRoute allowedRoles={['CLIENT']}><ClientDepartments /></ProtectedRoute>} />
        <Route path="/client/locations" element={<ProtectedRoute allowedRoles={['CLIENT']}><ClientLocations /></ProtectedRoute>} />
        <Route path="/client/test" element={<TestPage />} />
        <Route path="/client/profile" element={<ProtectedRoute allowedRoles={['CLIENT']}><ClientProfile /></ProtectedRoute>} />
        <Route path="/client/settings" element={<ProtectedRoute allowedRoles={['CLIENT']}><ClientSettings /></ProtectedRoute>} />
        
        {/* Applicant routes */}
         <Route path="/applicant" element={<ProtectedRoute allowedRoles={['APPLICANT']}><ApplicantDashboard /></ProtectedRoute>} />
          <Route path="/applicant/jobs" element={<ProtectedRoute allowedRoles={['APPLICANT']}><ApplicantJobs /></ProtectedRoute>} />
          <Route path="/applicant/jobs/:id" element={<ProtectedRoute allowedRoles={['APPLICANT']}><JobDetails /></ProtectedRoute>} />
        <Route path="/applicant/applications" element={<ProtectedRoute allowedRoles={['APPLICANT']}><ApplicantApplications /></ProtectedRoute>} />
        <Route path="/applicant/contracts" element={<ProtectedRoute allowedRoles={['APPLICANT']}><ApplicantContracts /></ProtectedRoute>} />
          <Route path="/applicant/applications/:applicationId" element={<ProtectedRoute allowedRoles={['APPLICANT']}><ApplicationTimeline /></ProtectedRoute>} />
          <Route path="/applicant/profile" element={<ProtectedRoute allowedRoles={['APPLICANT']}><ApplicantProfile /></ProtectedRoute>} />
          <Route path="/applicant/settings" element={<ProtectedRoute allowedRoles={['APPLICANT']}><ApplicantSettings /></ProtectedRoute>} />
          <Route path="/applicant/interviews" element={<ProtectedRoute allowedRoles={['APPLICANT']}><ApplicantInterviews /></ProtectedRoute>} />
        
        {/* Feature pages */}
        <Route path="/whatsapp" element={<ProtectedRoute><WhatsAppIntegration /></ProtectedRoute>} />
        <Route path="/contracts" element={<ProtectedRoute><ContractManagement /></ProtectedRoute>} />
        <Route path="/timeline" element={<ProtectedRoute><CandidateTimeline /></ProtectedRoute>} />
        
        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
        </Routes>
        
        <Toaster />
        </div>
      </DepartmentsProvider>
    </AuthProvider>
  );
}

export default App;
