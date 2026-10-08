import { useEffect } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AppProvider } from "./store";
import { useApp } from "./appContext";
import { homeFor } from "./lib/routes";
import { RequireAuth } from "./components/AppShell";
import { DashboardLayout } from "./components/DashboardLayout";
import { PublicLayout } from "./components/PublicLayout";
import IncudormLanding from "./pages/IncudormLanding";
import AuthPage from "./pages/AuthPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProjectFeedPage from "./pages/ProjectFeedPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import TalentDirectoryPage from "./pages/TalentDirectoryPage";
import ProfilePage from "./pages/ProfilePage";
import MessagesPage from "./pages/MessagesPage";
import MyProjectsPage from "./pages/dashboard/MyProjectsPage";
import MyApplicationsPage from "./pages/dashboard/MyApplicationsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import FeedbackPage from "./pages/FeedbackPage";

function LandingRoute() {
  const nav = useNavigate();
  const { currentUser } = useApp();
  if (currentUser) return <Navigate to={homeFor(currentUser)} replace />;
  return (
    <IncudormLanding
      onSignUp={(email) => nav(`/auth?mode=signup&email=${encodeURIComponent(email)}`)}
      onLogin={() => nav("/auth?mode=login")}
      footerLinks={
        <>
          <Link to="/feedback">Feedback</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </>
      }
    />
  );
}

/**
 * Signs the student out (or deletes the account when opened from Settings), then shows the landing page.
 * Doing this on its own route avoids a race with the signed-in layout's redirect to /auth.
 * Deleting only works through router state, so a link on another site can't trigger it.
 */
function LogoutRoute() {
  const loc = useLocation();
  const { currentUser, logOut, deleteAccount } = useApp();
  const wantsDelete = (loc.state as { deleteAccount?: boolean } | null)?.deleteAccount === true;

  useEffect(() => {
    if (wantsDelete) deleteAccount();
    else logOut();
  }, [wantsDelete, logOut, deleteAccount]);

  if (currentUser) return null;
  return <Navigate to="/" replace />;
}

/**
 * Site map:
 *   Public        /                         Landing page
 *                 /auth                     Sign up, log in and email verification
 *   Onboarding    /onboarding               Profile setup wizard
 *   App           /projects                 Project discovery feed
 *                 /projects/:id             Project details and apply modal
 *                 /projects/create          Post an idea
 *                 /students                 Student / talent directory
 *                 /profile/:id              Student public profile
 *                 /dashboard/my-projects    My projects and incoming requests
 *                 /dashboard/applications   Applications I sent
 *                 /settings                 Settings and edit profile
 *                 /messages(/:threadId)     Chats with matches (extra, not in the site map)
 *   Legal         /privacy, /terms
 */
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingRoute />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/logout" element={<LogoutRoute />} />

          <Route element={<PublicLayout />}>
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route path="/projects" element={<ProjectFeedPage />} />
            <Route path="/projects/create" element={<CreateProjectPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/students" element={<TalentDirectoryPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:threadId" element={<MessagesPage />} />

            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Navigate to="/dashboard/my-projects" replace />} />
              <Route path="/dashboard/my-projects" element={<MyProjectsPage />} />
              <Route path="/dashboard/applications" element={<MyApplicationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
