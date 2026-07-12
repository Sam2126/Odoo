"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransitStore, PREDEFINED_USERS, Role, getPermission } from "@/lib/store";
import {
  LayoutDashboard,
  Truck,
  Users,
  Compass,
  Wrench,
  Fuel,
  BarChart3,
  Settings as SettingsIcon,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Command,
  Shield
} from "lucide-react";
import CommandPalette from "./CommandPalette";
import DemoTour from "./DemoTour";
import { toast } from "sonner";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { currentUser, setCurrentUser, notifications, clearNotifications } = useTransitStore();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    }
    return false;
  });
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  // Sync dark mode class with state
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  // Keyboard shortcut Ctrl+K for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // If not logged in, render the login page inline (prevents unauthenticated access completely)
  if (!currentUser) {
    return <LoginScreen />;
  }

  // Navigation Links
  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Fleet", href: "/fleet", icon: Truck },
    { name: "Drivers", href: "/drivers", icon: Users },
    { name: "Trips", href: "/trips", icon: Compass },
    { name: "Maintenance", href: "/maintenance", icon: Wrench },
    { name: "Fuel & Expenses", href: "/fuel-expenses", icon: Fuel },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  const moduleKeyMap: Record<string, 'fleet' | 'drivers' | 'trips' | 'maintenance' | 'fuelExp' | 'analytics' | null> = {
    "/dashboard": null,
    "/fleet": "fleet",
    "/drivers": "drivers",
    "/trips": "trips",
    "/maintenance": "maintenance",
    "/fuel-expenses": "fuelExp",
    "/analytics": "analytics",
    "/settings": null,
  };

  const visibleLinks = navLinks.filter(link => {
    const key = moduleKeyMap[link.href];
    if (!key) return true;
    return getPermission(currentUser.role, key) !== 'none';
  });

  // Map roles to displays
  const roleDisplay: Record<Role, string> = {
    FLEET_MANAGER: "Fleet Manager",
    DRIVER: "Driver",
    SAFETY_OFFICER: "Safety Officer",
    FINANCIAL_ANALYST: "Financial Analyst",
  };

  const activeLink = navLinks.find((link) => pathname.startsWith(link.href)) || navLinks[0];
  const currentKey = moduleKeyMap[pathname];
  const hasPageAccess = currentKey ? getPermission(currentUser.role, currentKey) !== 'none' : true;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Collapsible Sidebar */}
      <aside
        className={`bg-[#0F172A] text-slate-100 flex flex-col justify-between transition-all duration-300 z-30 ${sidebarCollapsed ? "w-16" : "w-64"
          } border-r border-slate-800 shrink-0`}
      >
        <div>
          {/* Logo Section */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
            {!sidebarCollapsed && (
              <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-white">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-blue-500 to-emerald-500 flex items-center justify-center shadow-md">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <span className="tracking-wide">TransitOps</span>
              </Link>
            )}
            {sidebarCollapsed && (
              <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-tr from-blue-600 via-blue-500 to-emerald-500 flex items-center justify-center">
                <Truck className="w-4 h-4 text-white" />
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors hidden md:block"
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {(mounted ? visibleLinks : navLinks).map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href) || (link.href === "/dashboard" && pathname === "/");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  title={sidebarCollapsed ? link.name : ""}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>{link.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer profile / Logout */}
        <div className="p-4 border-t border-slate-800">
          {!sidebarCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm">
                  {currentUser.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-semibold text-white truncate">{currentUser.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{roleDisplay[currentUser.role]}</p>
                </div>
              </div>
              <button
                onClick={() => setCurrentUser(null)}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-150"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentUser(null)}
              className="w-9 h-9 mx-auto flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 z-20 transition-colors">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize hidden sm:inline">
              TransitOps / <span className="text-slate-800 dark:text-slate-200 font-semibold">{activeLink.name}</span>
            </span>

            {/* Search Bar / Ctrl+K trigger */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors w-40 sm:w-60 text-left"
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1 truncate">Quick search...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-[10px] font-mono shadow-xs">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Topbar Operations */}
          <div className="flex items-center gap-3">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Command Palette"
            >
              <Command className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={mounted && isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              {mounted && isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notifications</h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => {
                          clearNotifications();
                          setShowNotifications(false);
                        }}
                        className="text-[10px] text-blue-600 hover:underline font-medium"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="px-4 py-2.5 border-b last:border-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex gap-2.5 items-start text-xs transition-colors"
                        >
                          <span
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === "error"
                                ? "bg-red-500"
                                : n.type === "warning"
                                  ? "bg-amber-500"
                                  : n.type === "success"
                                    ? "bg-emerald-500"
                                    : "bg-blue-500"
                              }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-600 dark:text-slate-300 leading-normal">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">{n.date}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Role Switcher Badge */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/60 rounded-full text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />
                <span>{roleDisplay[currentUser.role]}</span>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
                    Switch Role (Demo)
                  </div>
                  {Object.entries(PREDEFINED_USERS).map(([email, user]) => (
                    <button
                      key={email}
                      onClick={() => {
                        setCurrentUser(user);
                        setShowRoleMenu(false);
                        router.refresh();
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex flex-col transition-colors ${currentUser.role === user.role
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                    >
                      <span>{user.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{roleDisplay[user.role]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Area */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {hasPageAccess ? (
            children
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-500">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Access Restricted</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                Your current role <strong>{roleDisplay[currentUser.role]}</strong> is not authorized to view the <strong>{activeLink.name}</strong> module.
              </p>
              <button
                onClick={() => setShowRoleMenu(true)}
                className="mt-6 bg-[#1E3A5F] hover:bg-[#152a46] text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-md transition-all active:scale-95"
              >
                Switch User Role
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Floating Demo Tour Widget */}
      <DemoTour />

      {/* Command Palette Modal */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </div>
  );
}

// -------------------------------------------------------------
// LOGIN COMPONENT
// -------------------------------------------------------------
function LoginScreen() {
  const { setCurrentUser, registeredUsers, registerUser } = useTransitStore();
  const [isSignUp, setIsSignUp] = useState(true);

  // Sign In inputs
  const [email, setEmail] = useState("driver@transitops.in");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState<Role>("DRIVER");

  // Sign Up inputs
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpRole, setSignUpRole] = useState<Role>("DRIVER");

  const [errorState, setErrorState] = useState<string | null>(null);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();

    // Check credentials matching registered list
    const foundUser = registeredUsers.find(
      (u) => u.email === email && u.role === role && u.password === password
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      setErrorState(null);
    } else {
      setErrorState("Invalid credentials. Role matching failure.");
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setErrorState("Please fill in all fields.");
      return;
    }

    const res = registerUser({
      name: signUpName,
      email: signUpEmail,
      password: signUpPassword,
      role: signUpRole
    });

    if (res.success) {
      // Auto sign in the newly registered user
      setCurrentUser({
        name: signUpName,
        email: signUpEmail,
        role: signUpRole
      });
      setErrorState(null);
      toast.success("Account created successfully!");
    } else {
      setErrorState(res.error || "Failed to create account.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0F172A] text-slate-100 font-sans transition-colors duration-200">
      {/* Left panel */}
      <div className="flex-1 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-12 select-none relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-radial from-blue-900/10 via-transparent to-transparent z-0 pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wide text-white">TransitOps</span>
          </div>
          <p className="text-slate-400 text-xs mt-1">Smart Transport Operations Platform</p>
        </div>

        <div className="my-auto py-12 z-10">
          <h2 className="text-2xl font-bold text-white mb-2 leading-tight">One login, four roles:</h2>
          <ul className="space-y-3.5 text-sm text-slate-300">
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Fleet Manager</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Dispatcher</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Safety Officer</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Financial Analyst</span>
            </li>
          </ul>
        </div>

        <div className="z-10 text-slate-500 text-xs flex justify-between items-center">
          <span>TRANSITOPS © 2026</span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 font-semibold uppercase tracking-wider border border-slate-700">RBAC ENABLED</span>
        </div>
      </div>

      {/* Right Form panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#0B0F19] relative">
        <div className="w-full max-w-sm">
          {isSignUp ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white tracking-tight mb-1.5">Create your account</h1>
                <p className="text-xs text-slate-400">Join TransitOps to manage fleet operations</p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="e.g. Vikram Mehta"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-150"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="e.g. manager@transitops.in"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-150"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-150"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Assign Role (RBAC Scope)
                  </label>
                  <select
                    value={signUpRole}
                    onChange={(e) => setSignUpRole(e.target.value as Role)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-150"
                  >
                    <option value="FLEET_MANAGER">Fleet Manager</option>
                    <option value="DRIVER">Driver</option>
                    <option value="SAFETY_OFFICER">Safety Officer</option>
                    <option value="FINANCIAL_ANALYST">Financial Analyst</option>
                  </select>
                </div>

                {/* Error Message Box */}
                {errorState && (
                  <div className="bg-red-950/40 border border-red-800/60 rounded-lg p-3 text-[11px] text-red-400 flex items-start gap-2.5 animate-in shake-in duration-150">
                    <span className="font-bold text-red-500 uppercase">Error:</span>
                    <p>{errorState}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#B26A00] hover:bg-[#8F5500] active:scale-[0.99] text-white rounded-lg py-2.5 text-xs font-semibold transition-all duration-150 mt-2 shadow-lg shadow-orange-950/20"
                >
                  Create Account
                </button>

                <div className="text-center text-xs text-slate-400 mt-4">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrorState(null);
                    }}
                    className="text-blue-500 hover:underline font-medium"
                  >
                    Sign In here
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white tracking-tight mb-1.5">Sign in to your account</h1>
                <p className="text-xs text-slate-400">Enter your credentials to continue</p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-150"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-150"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Role (RBAC)
                  </label>
                  <select
                    value={role}
                    onChange={(e) => {
                      const selectedRole = e.target.value as Role;
                      setRole(selectedRole);
                      // Match email helper to make demo signin easy
                      const emails: Record<Role, string> = {
                        FLEET_MANAGER: "manager@transitops.in",
                        DRIVER: "driver@transitops.in",
                        SAFETY_OFFICER: "safety@transitops.in",
                        FINANCIAL_ANALYST: "analyst@transitops.in"
                      };
                      setEmail(emails[selectedRole]);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-150"
                  >
                    <option value="FLEET_MANAGER">Fleet Manager</option>
                    <option value="DRIVER">Driver</option>
                    <option value="SAFETY_OFFICER">Safety Officer</option>
                    <option value="FINANCIAL_ANALYST">Financial Analyst</option>
                  </select>
                </div>

                {/* Error Message Box */}
                {errorState && (
                  <div className="bg-red-950/40 border border-red-800/60 rounded-lg p-3 text-[11px] text-red-400 flex items-start gap-2.5 animate-in shake-in duration-150">
                    <span className="font-bold text-red-500 uppercase">Error:</span>
                    <p>{errorState}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-0 focus:ring-offset-0 animate-none"
                    />
                    <span>Remember me</span>
                  </label>
                  <span className="text-blue-500 hover:underline cursor-pointer">Forgot password?</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#B26A00] hover:bg-[#8F5500] active:scale-[0.99] text-white rounded-lg py-2.5 text-xs font-semibold transition-all duration-150 mt-2 shadow-lg shadow-orange-950/20"
                >
                  Sign In
                </button>

                <div className="text-center text-xs text-slate-400 mt-4">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrorState(null);
                    }}
                    className="text-blue-500 hover:underline font-medium"
                  >
                    Register here
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Quick instructions text */}
          <div className="mt-8 pt-6 border-t border-slate-800/40 text-[10px] text-slate-500 leading-relaxed text-center">
            Access is scoped by role after login:<br />
            • Manager → Fleet, Maintenance | • Driver → Dashboard, Trips<br />
            • Safety → Drivers, Compliance | • Financial → Expenses, Analytics
          </div>
        </div>
      </div>
    </div>
  );
}
