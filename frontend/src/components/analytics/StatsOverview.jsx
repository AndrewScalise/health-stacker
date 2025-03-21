// StatsOverview.jsx
import React from "react";
import {
  Award,
  BarChart2,
  Calendar,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StatsOverview = ({ analytics }) => {
  if (!analytics) return null;

  const { completion, streaks } = analytics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle size={14} />
            Completion Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(completion.overall.rate)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {completion.overall.completedDays} of {completion.overall.totalDays}{" "}
            days
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
          <div className="text-2xl font-bold">{streaks.current} days</div>
          <p className="text-xs text-muted-foreground">
            {streaks.currentActive ? "Active" : "Inactive"} streak
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Award size={14} />
            Longest Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{streaks.longest} days</div>
          <p className="text-xs text-muted-foreground">
            {streaks.longestStart &&
              `Started ${new Date(streaks.longestStart).toLocaleDateString()}`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar size={14} />
            Best Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics.patterns?.bestDay?.day || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {analytics.patterns?.bestDay?.rate
              ? `${Math.round(analytics.patterns.bestDay.rate)}% completion`
              : "No data yet"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;
