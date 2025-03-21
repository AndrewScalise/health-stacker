// src/pages/AnalyticsPage.jsx
import React, { useState, useEffect } from "react";
import { getAnalyticsOverview } from "@/api/analytics.api";
import { getHabits } from "@/api/habits.api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PageHeader from "@/components/layout/PageHeader";
import StatsOverview from "@/components/analytics/StatsOverview";
import HabitCompletion from "@/components/analytics/HabitCompletion";
import StreakChart from "@/components/analytics/StreakChart";
import HabitComparison from "@/components/analytics/HabitComparison";
import ConsistencyScore from "@/components/analytics/ConsistencyScore";
import CompletionCalendar from "@/components/analytics/CompletionCalendar";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import { toast } from "sonner";

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Fetch analytics data
      const analyticsResponse = await getAnalyticsOverview();
      setAnalytics(analyticsResponse.data);

      // Fetch habits for comparison chart
      const habitsResponse = await getHabits();
      setHabits(habitsResponse.data);
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
      toast.error("Failed to load analytics. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Review your habit performance and patterns"
      />

      {/* Stats Overview */}
      <StatsOverview analytics={analytics} />

      {/* Tabs for different analytics views */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HabitCompletion
              completionByDay={analytics?.completion?.byDay || {}}
            />
            <StreakChart streakHistory={analytics?.streakHistory || []} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ConsistencyScore analytics={analytics} />
            <CompletionCalendar checkins={analytics?.recentCheckins || []} />
          </div>
        </TabsContent>

        {/* Habits Tab */}
        <TabsContent value="habits" className="mt-6">
          <HabitComparison habits={habits} />
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="mt-6">
          <div className="p-8 text-center bg-muted rounded-lg">
            <h3 className="text-lg font-medium mb-2">
              Advanced Trend Analysis
            </h3>
            <p className="text-muted-foreground mb-4">
              Unlock advanced trend analysis with a premium subscription.
            </p>
            <p className="text-sm text-muted-foreground">
              Premium features include prediction models, habit correlation
              analysis, and personalized improvement recommendations.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
