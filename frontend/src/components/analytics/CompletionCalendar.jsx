// CompletionCalendar.jsx
import React from "react";
import { format, parseISO, getMonth, getYear } from "date-fns";
import { Calendar, CheckCircle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Util to group data by month
const groupByMonth = (data) => {
  return data.reduce((acc, item) => {
    const date = parseISO(item.date);
    const monthYear = `${getYear(date)}-${getMonth(date) + 1}`;

    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }

    acc[monthYear].push(item);
    return acc;
  }, {});
};

const CompletionCalendar = ({ checkins = [] }) => {
  // Group data by month
  const groupedData = groupByMonth(checkins);

  // Get unique month-year combinations
  const months = Object.keys(groupedData).sort().reverse();

  // Get formatted month names for display
  const monthNames = months.map((month) => {
    const [year, monthIndex] = month.split("-");
    return format(
      new Date(parseInt(year), parseInt(monthIndex) - 1),
      "MMMM yyyy"
    );
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar size={18} />
          Completion Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {months.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No completion data available
          </p>
        ) : (
          <Tabs defaultValue={months[0]}>
            <TabsList className="w-full flex-wrap h-auto py-1">
              {months.map((month, index) => (
                <TabsTrigger key={month} value={month} className="text-xs">
                  {monthNames[index]}
                </TabsTrigger>
              ))}
            </TabsList>

            {months.map((month) => (
              <TabsContent key={month} value={month} className="mt-4">
                <div className="grid grid-cols-7 gap-1">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-xs text-muted-foreground"
                      >
                        {day}
                      </div>
                    )
                  )}

                  {/* Calendar grid for the month */}
                  {createMonthCalendarGrid(month, groupedData[month])}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to create the calendar grid for a month
const createMonthCalendarGrid = (monthStr, data) => {
  const [year, month] = monthStr.split("-").map((n) => parseInt(n));
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();

  // Calculate offset for first day of month
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday

  // Create array for all days in the month
  const days = [];

  // Add empty cells for days before the 1st
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-10 w-full"></div>);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const dayData = data.find(
      (d) => format(parseISO(d.date), "yyyy-MM-dd") === dateStr
    );

    days.push(
      <div
        key={day}
        className="h-10 w-full flex flex-col items-center justify-center text-sm border rounded-md"
      >
        <div className="text-xs">{day}</div>
        {dayData && (
          <div className="mt-1">
            {dayData.completed ? (
              <CheckCircle size={14} className="text-green-600" />
            ) : (
              <X size={14} className="text-red-600" />
            )}
          </div>
        )}
      </div>
    );
  }

  return days;
};

export default CompletionCalendar;
