// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Calendar,
  CheckCircle,
  TrendingUp,
  Plus,
  BarChart,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import HabitList from "@/components/habits/HabitList";
import { getHabits } from "@/api/habits.api";
import { getAnalyticsOverview } from "@/api/analytics.api";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/layout/LoadingSpinner";

const DashboardPage = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch habits data
      const habitsResponse = await getHabits();
      setHabits(habitsResponse.data);

      // Fetch analytics data
      const analyticsResponse = await getAnalyticsOverview();
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Calculate stats
  const totalHabits = habits.length;
  const activeHabits = habits.filter((h) => !h.archivedAt).length;
  const completedToday = habits.filter((h) => h.completedToday).length;
  const completionRate =
    totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.firstName || "User"}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your habits and progress
          </p>
        </div>
        <Button className="mt-4 sm:mt-0" size="sm" asChild>
          <Link to="/habits">
            <Plus size={16} className="mr-2" />
            New Habit
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity size={14} />
              Total Habits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHabits}</div>
            <p className="text-xs text-muted-foreground">
              {activeHabits} active, {totalHabits - activeHabits} archived
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle size={14} />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedToday}/{totalHabits}
            </div>
            <Progress value={completionRate} className="h-1.5 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(completionRate)}% completed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp size={14} />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.streaks?.current || 0} days
            </div>
            <p className="text-xs text-muted-foreground">
              Longest: {analytics?.streaks?.longest || 0} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar size={14} />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalHabits - completedToday}
            </div>
            <p className="text-xs text-muted-foreground">
              Habits to complete today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/calendar">
            <Calendar size={16} className="mr-2" />
            View Calendar
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/analytics">
            <BarChart size={16} className="mr-2" />
            View Analytics
          </Link>
        </Button>
      </div>

      {/* Habits List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Today's Habits</h2>
        <HabitList />
      </div>
    </div>
  );
};

export default DashboardPage;
