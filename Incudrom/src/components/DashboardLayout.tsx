import { NavLink, Outlet } from "react-router-dom";
import { useApp } from "../appContext";
import { PageHead } from "./ui";

/** Wraps /dashboard/my-projects, /dashboard/applications and /settings with shared tabs. */
export function DashboardLayout() {
  const { currentUser, projects, applications } = useApp();
  const myIds = new Set(projects.filter((p) => p.ownerId === currentUser?.id).map((p) => p.id));
  const pending = applications.filter((a) => a.status === "pending" && myIds.has(a.projectId)).length;
  const cls = ({ isActive }: { isActive: boolean }) => `inc-subtab${isActive ? " active" : ""}`;

  return (
    <>
      <PageHead title="Dashboard" subtitle="Manage your ideas, requests and profile." />
      <nav className="inc-subnav" aria-label="Dashboard">
        <NavLink to="/dashboard/my-projects" className={cls}>
          My projects
          {pending > 0 && <span className="inc-count" aria-label={`${pending} pending requests`}>{pending}</span>}
        </NavLink>
        <NavLink to="/dashboard/applications" className={cls}>Applications sent</NavLink>
        <NavLink to="/settings" className={cls}>Settings</NavLink>
      </nav>
      <Outlet />
    </>
  );
}
