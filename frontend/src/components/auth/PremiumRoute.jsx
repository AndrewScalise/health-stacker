import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/Layout/LoadingSpinner";

/**
 * A wrapper component that redirects to subscription page if user doesn't have premium access
 */
const PremiumRoute = ({ children }) => {
  const { isAuthenticated, isPremium, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth status
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to subscription page if not premium
  if (!isPremium) {
    return <Navigate to="/subscription" state={{ from: location }} replace />;
  }

  // Render children if authenticated and has premium
  return children;
};

export default PremiumRoute;
