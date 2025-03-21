// StreakChart.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StreakChart = ({ streakHistory = [] }) => {
  // Format data for the chart
  const chartData = streakHistory.map((item) => ({
    date: item.date,
    streak: item.streak,
    formattedDate: format(parseISO(item.date), "MMM d"),
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Streak History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickMargin={10}
                allowDecimals={false}
                domain={[0, "dataMax + 1"]}
              />
              <Tooltip
                formatter={(value) => [`${value} days`, "Streak"]}
                labelFormatter={(value) => `Date: ${value}`}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #f0f0f0",
                  borderRadius: "4px",
                  padding: "10px",
                }}
              />
              <Line
                type="monotone"
                dataKey="streak"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3, fill: "#3b82f6" }}
                activeDot={{ r: 5, fill: "#1d4ed8" }}
                name="Streak"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakChart;
