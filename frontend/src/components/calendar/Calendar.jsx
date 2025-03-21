// Calendar.jsx - Main calendar component
import React, { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MonthGrid from "./MonthGrid";

const Calendar = ({ habitData = [], onDateClick, title = "Calendar View" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePreviousMonth = () => {
    setCurrentDate((prevDate) => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => addMonths(prevDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon size={18} />
            {title}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
        <div className="text-lg font-medium">
          {format(currentDate, "MMMM yyyy")}
        </div>
      </CardHeader>
      <CardContent>
        <MonthGrid
          currentDate={currentDate}
          habitData={habitData}
          onDateClick={onDateClick}
        />
      </CardContent>
    </Card>
  );
};

export default Calendar;
