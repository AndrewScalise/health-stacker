// DayView.jsx - Component for viewing a single day's habits
import React from "react";
import { format } from "date-fns";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DayView = ({
  date = new Date(),
  habits = [], // Array of habits with status for this day
  onCheckin,
  onClose,
}) => {
  const totalHabits = habits.length;
  const completedHabits = habits.filter((h) => h.completedToday).length;
  const completionRate = totalHabits
    ? Math.round((completedHabits / totalHabits) * 100)
    : 0;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar size={18} />
            {format(date, "EEEE, MMMM d, yyyy")}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="bg-muted">
            {completedHabits}/{totalHabits} habits completed
          </Badge>
          <Badge
            variant="outline"
            className={`${
              completionRate >= 80
                ? "bg-green-100 text-green-800"
                : completionRate >= 50
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {completionRate}% completed
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {habits.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No habits scheduled for this day
            </div>
          ) : (
            habits.map((habit) => (
              <div
                key={habit._id}
                className="flex items-start gap-3 p-3 border rounded-md"
              >
                <div
                  className={`p-2 rounded-full ${
                    habit.completedToday ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <CheckCircle
                    size={16}
                    className={
                      habit.completedToday ? "text-green-600" : "text-gray-400"
                    }
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{habit.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {habit.category && (
                      <Badge variant="outline" className="mr-2 capitalize">
                        {habit.category}
                      </Badge>
                    )}
                    {habit.reminderTime && (
                      <span className="inline-flex items-center text-xs">
                        <Clock size={12} className="mr-1" />
                        {habit.reminderTime}
                      </span>
                    )}
                  </div>
                </div>
                {new Date(date) <= new Date() && !habit.completedToday && (
                  <Button size="sm" onClick={() => onCheckin(habit._id)}>
                    Complete
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DayView;
