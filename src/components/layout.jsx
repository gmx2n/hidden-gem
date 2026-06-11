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
    <div className="min-h-screen flex flex-col" data-theme="emerald">

      <div className="flex-1 overflow-y-auto pb-30">
        <Outlet />
      </div>

      <nav className="bg-base-300 dock p-4 flex justify-between h-15 border-t border-base-200">

        <Authenticated className="flex gap-4 items-center">
          <NavLink
            to="/map"
            className={({ isActive }) => (isActive ? "text-secondary font-bold text-m" : "")}
          >
            Map
          </NavLink>

          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "text-secondary font-bold text-m" : "")}
          >
            Explore
          </NavLink>

        </Authenticated>


        <div className="flex justify-between items-center">
          <Authenticated>
            <div className="flex gap-2">
              <button
                className="btn btn-primary btn-sm ml-2"
                onClick={() => navigate("/create-post")}
              >
                Post
              </button>
              <NavLink className="w-fit whitespace-nowrap"
                to="/profile"
              >
                🔍{user?.email.split("@")[0]}
              </NavLink>
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
