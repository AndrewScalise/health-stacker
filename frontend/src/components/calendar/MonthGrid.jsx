// MonthGrid.jsx - Component for the month view
import React from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
} from "date-fns";
import DayCell from "./DayCell";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MonthGrid = ({
  currentDate = new Date(),
  habitData = [],
  onDateClick,
}) => {
  // Generate days for the current month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // Get all days to display
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // Group days into weeks
  const weeks = [];
  let week = [];

  calendarDays.forEach((day) => {
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }

    // Find status for this day
    const dayData = habitData.find((d) => isSameDay(new Date(d.date), day));
    let status = null;

    if (dayData) {
      status = dayData.completed ? "completed" : "missed";
    }

    week.push({
      date: day,
      isCurrentMonth: isSameMonth(day, monthStart),
      isToday: isSameDay(day, new Date()),
      status,
    });
  });

  if (week.length > 0) {
    weeks.push(week);
  }

  return (
    <div className="w-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {weeks.map((week, weekIndex) => (
        <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-1 mb-1">
          {week.map((day, dayIndex) => (
            <DayCell
              key={`day-${weekIndex}-${dayIndex}`}
              date={day.date}
              isCurrentMonth={day.isCurrentMonth}
              isToday={day.isToday}
              status={day.status}
              onClick={() => onDateClick(day.date)}
              disabled={new Date(day.date) > new Date()} // Disable future dates
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default MonthGrid;
