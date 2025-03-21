// DayCell.jsx - Component for a single day in the calendar
import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, X } from "lucide-react";

const DayCell = ({
  date,
  isCurrentMonth = true,
  isToday = false,
  status = null, // 'completed', 'missed', or null
  onClick,
  disabled = false,
}) => {
  return (
    <div
      className={cn(
        "h-10 w-10 rounded-full flex items-center justify-center text-sm cursor-pointer relative",
        isCurrentMonth ? "text-foreground" : "text-muted-foreground",
        isToday && "border border-primary",
        status === "completed" && "bg-green-100",
        status === "missed" && "bg-red-100",
        disabled && "cursor-not-allowed opacity-50",
        !disabled && !status && "hover:bg-muted"
      )}
      onClick={disabled ? undefined : onClick}
    >
      {date.getDate()}
      {status === "completed" && (
        <CheckCircle
          size={14}
          className="absolute -bottom-1 -right-1 text-green-600 bg-white rounded-full"
        />
      )}
      {status === "missed" && (
        <X
          size={14}
          className="absolute -bottom-1 -right-1 text-red-600 bg-white rounded-full"
        />
      )}
    </div>
  );
};

export default DayCell;
