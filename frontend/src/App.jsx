// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./hooks/useAuth";

// Layouts
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Main Pages
import DashboardPage from "./pages/dashboard/DashboardPage";
import HabitsPage from "./pages/habits/HabitsPage";
import HabitDetailPage from "./pages/habits/HabitDetailPage";
import CalendarPage from "./pages/calendar/CalendarPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import AccountabilityPage from "./pages/accountability/AccountabilityPage";
import AchievementsPage from "./pages/achievements/AchievementsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import ProfilePage from "./pages/profile/ProfilePage";
import SubscriptionPage from "./pages/subscription/SubscriptionPage";

// Route Guards
import PrivateRoute from "./components/auth/PrivateRoute";
import PremiumRoute from "./components/auth/PremiumRoute";

// Error Handling
import ErrorBoundary from "./components/layout/ErrorBoundary";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <ErrorBoundary>
          <Router>
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPasswordPage />}
                />
              </Route>

              {/* Protected Routes */}
              <Route element={<MainLayout />}>
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  }
                />

                {/* Habit Routes */}
                <Route
                  path="/habits"
                  element={
                    <PrivateRoute>
                      <HabitsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/habits/:id"
                  element={
                    <PrivateRoute>
                      <HabitDetailPage />
                    </PrivateRoute>
                  }
                />

                {/* Other Main Routes */}
                <Route
                  path="/calendar"
                  element={
                    <PrivateRoute>
                      <CalendarPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <PrivateRoute>
                      <AnalyticsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/accountability"
                  element={
                    <PremiumRoute>
                      <AccountabilityPage />
                    </PremiumRoute>
                  }
                />
                <Route
                  path="/achievements"
                  element={
                    <PrivateRoute>
                      <AchievementsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <SettingsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/subscription"
                  element={
                    <PrivateRoute>
                      <SubscriptionPage />
                    </PrivateRoute>
                  }
                />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
          <Toaster />
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
