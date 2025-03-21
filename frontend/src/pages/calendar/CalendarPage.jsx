// src/pages/calendar/CalendarPage.jsx
import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths, isSameDay } from "date-fns";
import { toast } from "sonner";

import Calendar from "@/components/calendar/Calendar";
import DayView from "@/components/calendar/DayView";
import HeatmapCalendar from "@/components/calendar/HeatmapCalendar";
import YearlyCalendar from "@/components/calendar/YearlyCalendar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/layout/LoadingSpinner";

import { getHabits } from "@/api/habits.api";
import { createCheckin } from "@/api/habits.api";

const CalendarPage = () => {
  const [habits, setHabits] = useState([]);
  const [calendarData, setCalendarData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [habitsForDay, setHabitsForDay] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    setIsLoading(true);
    try {
      const response = await getHabits();
      const habitsData = response.data;
      setHabits(habitsData);

      // Process habits data to get calendar data with completion status
      processHabitsForCalendar(habitsData);
    } catch (error) {
      console.error("Failed to fetch habits:", error);
      toast.error("Failed to load habits data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const processHabitsForCalendar = (habitsData) => {
    // Create a mapping of dates to completion status
    const dateMap = {};

    // Loop through each habit's check-ins
    habitsData.forEach((habit) => {
      if (habit.checkins && habit.checkins.length > 0) {
        habit.checkins.forEach((checkin) => {
          const dateStr = format(new Date(checkin.date), "yyyy-MM-dd");
          if (!dateMap[dateStr]) {
            dateMap[dateStr] = {
              date: dateStr,
              completed: 0,
              total: 0,
            };
          }

          dateMap[dateStr].total += 1;
          if (checkin.completed) {
            dateMap[dateStr].completed += 1;
          }
        });
      }
    });

    // Convert map to array for calendar component
    const calendarDataArray = Object.values(dateMap).map((day) => ({
      date: day.date,
      completed: day.completed === day.total, // Only mark as completed if all habits completed
      partiallyCompleted: day.completed > 0 && day.completed < day.total,
      completionRate: day.total > 0 ? (day.completed / day.total) * 100 : 0,
    }));

    setCalendarData(calendarDataArray);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);

    // Filter habits for the selected date
    const habitsForSelectedDay = habits.map((habit) => {
      // Check if habit was completed on this day
      const completedOnDay = habit.checkins?.some(
        (checkin) =>
          isSameDay(new Date(checkin.date), date) && checkin.completed
      );

      return {
        ...habit,
        completedToday: completedOnDay,
      };
    });

    setHabitsForDay(habitsForSelectedDay);
  };

  const handleCheckin = async (habitId) => {
    if (!selectedDate) return;

    try {
      await createCheckin(habitId, {
        date: selectedDate.toISOString(),
        completed: true,
      });

      toast.success("Habit marked as completed!");

      // Refresh data
      fetchHabits();

      // Update habitsForDay to reflect the change
      setHabitsForDay((prevHabits) =>
        prevHabits.map((habit) =>
          habit._id === habitId ? { ...habit, completedToday: true } : habit
        )
      );
    } catch (error) {
      console.error("Failed to complete habit:", error);
      toast.error("Failed to mark habit as completed. Please try again.");
    }
  };

  const handleCloseDayView = () => {
    setSelectedDate(null);
    setHabitsForDay([]);
  };

  const handleYearChange = (year) => {
    setCurrentYear(year);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="View your habit completion history and track your progress"
      />

      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="yearly">Yearly Overview</TabsTrigger>
        </TabsList>

        {/* Monthly Calendar View */}
        <TabsContent value="monthly" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Calendar
                habitData={calendarData}
                onDateClick={handleDateClick}
                title="Monthly Calendar"
              />
            </div>

            <div className="lg:col-span-1">
              {selectedDate ? (
                <DayView
                  date={selectedDate}
                  habits={habitsForDay}
                  onCheckin={handleCheckin}
                  onClose={handleCloseDayView}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Day Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center py-6 text-muted-foreground">
                      Select a date to view details and track your habits
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Heatmap View */}
        <TabsContent value="heatmap" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Habit Completion Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <HeatmapCalendar
                habitData={calendarData}
                startDate={
                  new Date(new Date().setDate(new Date().getDate() - 90))
                }
                endDate={new Date()}
                title="Activity Heatmap"
              />
            </CardContent>
          </Card>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Understanding Your Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The heatmap shows your habit completion over the last 90 days.
                  Green cells indicate days where you completed all habits, red
                  cells show days with missed habits, and gray cells are days
                  with no scheduled habits.
                </p>

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Insights:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Look for patterns in your habit completion</li>
                    <li>• Identify days of the week where you struggle</li>
                    <li>• Track your consistency over time</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Yearly Overview */}
        <TabsContent value="yearly" className="mt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleYearChange(currentYear - 1)}
              >
                Previous Year
              </Button>

              <span className="text-lg font-medium">{currentYear}</span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleYearChange(currentYear + 1)}
                disabled={currentYear >= new Date().getFullYear()}
              >
                Next Year
              </Button>
            </div>

            <YearlyCalendar
              year={currentYear}
              habitData={calendarData}
              onMonthClick={(date) => {
                // Set the calendar to this month
                handleDateClick(new Date(date));
              }}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Calendar Tips */}
      <div className="mt-6">
        <Separator className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Track Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Click on any day to view and complete your habits for that date.
                Track your consistency and build streaks over time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                View Different Perspectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Switch between monthly, heatmap, and yearly views to gain
                different insights into your habit completion patterns.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Stay Consistent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Use the calendar to maintain your habit streaks. Remember,
                consistency is key to building lasting habits that transform
                your life.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
