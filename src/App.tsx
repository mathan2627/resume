import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { SkillsProofPage } from "@/pages/SkillsProofPage";
import { ChallengesPage } from "@/pages/ChallengesPage";
import { InternshipsPage } from "@/pages/InternshipsPage";
import { RoadmapPage } from "@/pages/RoadmapPage";
import { ApplicationsPage } from "@/pages/ApplicationsPage";
import { ResumePage } from "@/pages/ResumePage";
import { InterviewPage } from "@/pages/InterviewPage";
import { ProofPassportPage } from "@/pages/ProofPassportPage";
import { PublicPassportView } from "@/pages/PublicPassportView";
import { CareerAssistantPage } from "@/pages/CareerAssistantPage";
import { RecruiterPortalPage } from "@/pages/RecruiterPortalPage";
import { RecruiterSearchPage } from "@/pages/RecruiterSearchPage";
import { AdminPage } from "@/pages/AdminPage";
import { AdminListingsPage } from "@/pages/AdminListingsPage";
import { AdminUsersPage } from "@/pages/AdminUsersPage";
import { AdminImportPage } from "@/pages/AdminImportPage";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/p/:tokenOrSlug" element={<PublicPassportView />} />

        {/* Authenticated Workspace Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/skills" element={<SkillsProofPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/internships" element={<InternshipsPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/passport" element={<ProofPassportPage />} />
          <Route path="/assistant" element={<CareerAssistantPage />} />

          {/* Recruiter Workspace Routes */}
          <Route path="/recruiter" element={<RecruiterPortalPage />} />
          <Route path="/recruiter/search" element={<RecruiterSearchPage />} />

          {/* Admin Workspace Routes */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/listings" element={<AdminListingsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/import" element={<AdminImportPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
