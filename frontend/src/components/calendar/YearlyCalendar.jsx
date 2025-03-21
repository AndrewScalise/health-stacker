// YearlyCalendar.jsx - Shows yearly view with month blocks
import React from "react";
import {
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  format,
  getDaysInMonth,
  isSameMonth,
  getMonth,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const YearlyCalendar = ({
  year = new Date().getFullYear(),
  habitData = [], // Array of { date, completed } objects
  onMonthClick,
  title = "Yearly Overview",
}) => {
  // Get all months in the year
  const months = eachMonthOfInterval({
    start: startOfYear(new Date(year, 0)),
    end: endOfYear(new Date(year, 0)),
  });

  // Calculate completion rate for each month
  const monthlyStats = months.map((month) => {
    const monthData = habitData.filter((d) => {
      const dataDate = new Date(d.date);
      return isSameMonth(dataDate, month);
    });

    const daysInMonth = getDaysInMonth(month);
    const totalDays = monthData.length;
    const completedDays = monthData.filter((d) => d.completed).length;
    const completionRate = totalDays ? (completedDays / totalDays) * 100 : 0;

    return {
      month,
      totalDays,
      completedDays,
      completionRate,
      color: getColorClass(completionRate),
    };
  });

  // Function to get color class based on completion rate
  function getColorClass(rate) {
    if (rate === 0) return "bg-gray-100";
    if (rate < 30) return "bg-red-200";
    if (rate < 60) return "bg-amber-200";
    if (rate < 80) return "bg-yellow-200";
    return "bg-green-200";
  }

  // Check if current month
  const isCurrentMonth = (monthIndex) => {
    return getMonth(new Date()) === monthIndex;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-2xl">{year}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {monthlyStats.map((data, index) => (
            <div
              key={index}
              className={cn(
                "cursor-pointer p-3 rounded-md transition-colors",
                data.color,
                isCurrentMonth(index) && "border-2 border-primary"
              )}
              onClick={() => onMonthClick(data.month)}
            >
              <div className="font-medium">{format(data.month, "MMM")}</div>
              <div className="text-sm text-muted-foreground">
                {data.completedDays}/{data.totalDays} days
              </div>
              <div className="text-xs font-semibold">
                {Math.round(data.completionRate)}% rate
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-end gap-2 mt-6">
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 mr-1 bg-gray-100 rounded"></div>
            <span>0%</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 mr-1 bg-red-200 rounded"></div>
            <span>&lt;30%</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 mr-1 bg-amber-200 rounded"></div>
            <span>&lt;60%</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 mr-1 bg-yellow-200 rounded"></div>
            <span>&lt;80%</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 mr-1 bg-green-200 rounded"></div>
            <span>≥80%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default YearlyCalendar;
