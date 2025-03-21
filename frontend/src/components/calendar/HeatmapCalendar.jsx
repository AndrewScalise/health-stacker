// HeatmapCalendar.jsx - Shows completion as a heatmap
import React from "react";
import { addDays, format, startOfWeek, eachDayOfInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const HeatmapCalendar = ({
  habitData = [], // Array of { date, completed } objects
  startDate = new Date(new Date().setDate(new Date().getDate() - 90)), // 90 days ago
  endDate = new Date(),
  title = "Activity Heatmap",
}) => {
  // Generate array of days to display
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  // Calculate week rows
  const weekStartDay = 0; // Sunday
  const firstDay = startOfWeek(startDate, { weekStartsOn: weekStartDay });
  const weeksNeeded = Math.ceil(days.length / 7);

  // Create weeks array
  const weeks = Array.from({ length: weeksNeeded }).map((_, i) => {
    return Array.from({ length: 7 }).map((_, j) => {
      const day = addDays(firstDay, i * 7 + j);
      const habitEntry = habitData.find(
        (d) =>
          format(new Date(d.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      );

      return {
        date: day,
        value: habitEntry ? (habitEntry.completed ? 1 : 0) : null,
      };
    });
  });

  // Get color based on value
  const getColorClass = (value) => {
    if (value === null) return "bg-gray-100";
    if (value === 0) return "bg-red-200";
    return "bg-green-400";
  };

  // Weekday labels
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex">
          {/* Weekday labels */}
          <div className="mt-6 pr-2">
            {weekdays.map((day, i) => (
              <div
                key={i}
                className="h-3 w-4 text-xs text-muted-foreground flex items-center justify-end mb-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap cells */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <TooltipProvider key={`${weekIndex}-${dayIndex}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "h-3 w-3 rounded-sm",
                              getColorClass(day.value)
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {format(day.date, "MMM d, yyyy")}:&nbsp;
                            {day.value === null
                              ? "No data"
                              : day.value === 1
                              ? "Completed"
                              : "Missed"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4">
          <Badge variant="outline" className="bg-gray-100">
            No Data
          </Badge>
          <Badge variant="outline" className="bg-red-200">
            Missed
          </Badge>
          <Badge variant="outline" className="bg-green-400 text-white">
            Completed
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeatmapCalendar;
