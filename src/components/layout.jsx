import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from 'react';

export default function Layout() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getUser);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" data-theme="nord">

      <div className="flex-1 overflow-y-auto pb-30">
        <Outlet />
      </div>

      <nav className="bg-base-300 dock p-4 flex justify-between h-15 border-t border-base-200">

        <Authenticated className="flex gap-4 items-center">
          <NavLink
            to="/map"
            className={({ isActive }) => (isActive ? "text-primary text-bold text-m" : "")}
          >
            Hidden Gem
          </NavLink>

          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "text-primary" : "")}
          >
            Explore
          </NavLink>

        </Authenticated>


        <div className="flex items-center">
          <Authenticated>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-primary btn-sm mx-2"
                onClick={() => navigate("/create-post")}
              >
                Post
              </button>
              <ul className="relative">
                <details className="dropdown dropdown-top dropdown-end">
                  <summary className="text-sm font-bold text-primary list-none cursor-pointer">
                    {user?.email.split("@")[0]}
                  </summary>
                  <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-24 bottom-full mb-2">
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
              </ul>
            </div>
          </Authenticated>
          <Unauthenticated>
            <NavLink to="/login">
              <button className="btn btn-sm">Login</button>
            </NavLink>
          </Unauthenticated>
        </div>
      </nav>
    </div>
  );
}
