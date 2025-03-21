// HabitComparison.jsx
import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HabitComparison = ({ habits = [] }) => {
  // Format data for radar chart
  const formatData = () => {
    // Get unique categories
    const categories = [
      ...new Set(habits.map((habit) => habit.category || "Uncategorized")),
    ];

    return categories.map((category) => {
      const habitsInCategory = habits.filter(
        (habit) => (habit.category || "Uncategorized") === category
      );
      const totalCompletionRate = habitsInCategory.reduce(
        (total, habit) => total + (habit.completionRate || 0),
        0
      );
      const avgCompletionRate =
        habitsInCategory.length > 0
          ? Math.round(totalCompletionRate / habitsInCategory.length)
          : 0;

      return {
        category,
        completionRate: avgCompletionRate,
        habitsCount: habitsInCategory.length,
      };
    });
  };

  const data = formatData();

  if (data.length < 3) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Need at least 3 different habit categories for comparison.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            You currently have {data.length} categories.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Category Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#f0f0f0" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickCount={6}
              />
              <Radar
                name="Completion Rate"
                dataKey="completionRate"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Completion Rate"]}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #f0f0f0",
                  borderRadius: "4px",
                  padding: "10px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitComparison;
