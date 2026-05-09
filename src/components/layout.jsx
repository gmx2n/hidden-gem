import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Layout() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getUser);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" data-theme="light">
      <nav className="bg-base-300 p-4 flex justify-between">
        {/* menus */}
        <div className="flex gap-4">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "text-primary" : "")}
          >
            Home
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? "text-primary" : "")}
          >
            Login
          </NavLink>
        </div>

        {/* user info */}
        <div>
          <Authenticated>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-primary btn-sm mx-2"
                onClick={() => navigate("/create-post")}
              >
                Post
              </button>
              <li>
                <details>
                  <summary className="text-sm font-bold text-primary">
                    🧑‍🦱 {user?.email.split("@")[0]}
                  </summary>
                  <ul className="rounded-t-none p-2">
                    <li>
                      <button
                        className="btn btn-neutral btn-sm"
                        onClick={() => signOut()}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </details>
              </li>
            </div>
          </Authenticated>
          <Unauthenticated>
            <NavLink to="/login">
              <button className="btn btn-sm">Login</button>
            </NavLink>
          </Unauthenticated>
        </div>
      </nav>
      <div className="flex-1 flex flex-col">
        <div></div>
        <Outlet />
      </div>
    </div>
  );
}
