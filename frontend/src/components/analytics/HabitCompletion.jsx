// HabitCompletion.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HabitCompletion = ({ completionByDay = {} }) => {
  // Format data for the chart
  const chartData = Object.entries(completionByDay).map(([day, data]) => ({
    day,
    rate: Math.round(data.rate),
    completed: data.completed,
    total: data.total,
  }));

  // Order days of the week correctly
  const daysOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const sortedData = [...chartData].sort((a, b) => {
    return daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
  });

  // Calculate average completion rate
  const totalRate = sortedData.reduce((sum, item) => sum + item.rate, 0);
  const averageRate = Math.round(totalRate / sortedData.length);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Completion by Day of Week</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} tickMargin={10} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickMargin={10}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "Completion Rate") {
                    return [`${value}%`, name];
                  }
                  return [value, name];
                }}
                labelFormatter={(value) => `Day: ${value}`}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #f0f0f0",
                  borderRadius: "4px",
                  padding: "10px",
                }}
              />
              <ReferenceLine
                y={averageRate}
                stroke="#888"
                strokeDasharray="3 3"
              >
                <label
                  position="right"
                  value={`Avg: ${averageRate}%`}
                  fill="#888"
                  fontSize={12}
                />
              </ReferenceLine>
              <Bar
                dataKey="rate"
                fill="#4ade80"
                radius={[4, 4, 0, 0]}
                name="Completion Rate"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitCompletion;
