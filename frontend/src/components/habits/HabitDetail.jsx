import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle,
  Edit,
  Trash2,
  Archive,
  ArchiveRestore,
  BarChart,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import HabitCheckinForm from "@/components/Habits/HabitCheckinForm";
import LoadingSpinner from "@/components/Layout/LoadingSpinner";
import {
  getHabit,
  getHabitCheckins,
  archiveHabit,
  unarchiveHabit,
} from "@/api/habits.api";
import { getHabitAnalytics } from "@/api/analytics.api";

const HabitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch habit data on component mount
  useEffect(() => {
    fetchHabitData();
  }, [id]);

  // Fetch habit data (habit details, check-ins, analytics)
  const fetchHabitData = async () => {
    setIsLoading(true);
    try {
      // Fetch habit details
      const habitResponse = await getHabit(id);
      setHabit(habitResponse.data);

      // Fetch habit check-ins
      const checkinsResponse = await getHabitCheckins(id);
      setCheckins(checkinsResponse.data);

      // Fetch habit analytics
      const analyticsResponse = await getHabitAnalytics(id);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error("Failed to fetch habit data:", error);
      toast.error("Failed to load habit data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle check-in creation
  const handleCheckinCreated = (response) => {
    // Add new check-in to the list
    setCheckins((prevCheckins) => [response.data, ...prevCheckins]);

    // Update habit streak information
    setHabit((prevHabit) => ({
      ...prevHabit,
      streak: response.streak,
      completedToday: true,
      lastCompleted: new Date().toISOString(),
    }));

    // Refetch analytics
    fetchAnalytics();
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const response = await getHabitAnalytics(id);
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  // Handle habit archive/unarchive
  const handleArchiveToggle = async () => {
    try {
      let response;
      if (habit.archivedAt) {
        response = await unarchiveHabit(habit._id);
        toast.success("Habit unarchived successfully!");
      } else {
        response = await archiveHabit(habit._id);
        toast.success("Habit archived successfully!");
      }
      setHabit(response.data);
    } catch (error) {
      console.error("Failed to archive/unarchive habit:", error);
      toast.error("Failed to update habit. Please try again.");
    }
  };

  // Render loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Render 404 state if habit not found
  if (!habit) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Habit Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The habit you're looking for doesn't exist or you don't have
          permission to view it.
        </p>
        <Button asChild>
          <Link to="/habits">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Habits
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button and actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link to="/habits">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Habits
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleArchiveToggle}
            className="gap-1"
          >
            {habit.archivedAt ? (
              <>
                <ArchiveRestore size={16} />
                Unarchive
              </>
            ) : (
              <>
                <Archive size={16} />
                Archive
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/habits/${habit._id}/edit`)}
            className="gap-1"
          >
            <Edit size={16} />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => navigate(`/habits/${habit._id}/delete`)}
            className="gap-1"
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>

      {/* Habit details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Habit info card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{habit.title}</CardTitle>
                  <CardDescription>
                    {habit.description || "No description"}
                  </CardDescription>
                </div>
                {habit.archivedAt && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Archive size={12} />
                    Archived
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {habit.category || "uncategorized"}
                </Badge>
                <Badge variant="outline">
                  {getFrequencyText(habit.frequency)}
                </Badge>
                {habit.reminderTime && (
                  <Badge variant="outline">
                    Reminder: {formatTime(habit.reminderTime)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {habit.streak?.current || 0}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Award size={12} />
                    Current Streak
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-amber-600">
                    {habit.streak?.longest || 0}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Award size={12} />
                    Longest Streak
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {analytics?.completion?.overall?.completedDays || 0}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <CheckCircle size={12} />
                    Total Completions
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for details, history, analytics */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {checkins.length === 0 ? (
                    <p className="text-muted-foreground">
                      No check-ins yet. Start tracking your habit by completing
                      it today!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {checkins.slice(0, 5).map((checkin) => (
                        <div
                          key={checkin._id}
                          className="flex items-start gap-3 pb-3 border-b last:border-b-0"
                        >
                          <div
                            className={`p-2 rounded-full ${
                              checkin.completed ? "bg-green-100" : "bg-gray-100"
                            }`}
                          >
                            <CheckCircle
                              size={16}
                              className={
                                checkin.completed
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div className="font-medium">
                                {checkin.completed
                                  ? "Completed"
                                  : "Not completed"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {format(parseISO(checkin.date), "MMM d, yyyy")}
                              </div>
                            </div>
                            {checkin.notes && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {checkin.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}

                      {checkins.length > 5 && (
                        <Button
                          variant="link"
                          onClick={() => setActiveTab("history")}
                          className="px-0"
                        >
                          View all check-ins
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Check-in History</CardTitle>
                </CardHeader>
                <CardContent>
                  {checkins.length === 0 ? (
                    <p className="text-muted-foreground">
                      No check-ins yet. Start tracking your habit by completing
                      it today!
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {checkins.map((checkin) => (
                          <TableRow key={checkin._id}>
                            <TableCell>
                              {format(parseISO(checkin.date), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`p-1 rounded-full ${
                                    checkin.completed
                                      ? "bg-green-100"
                                      : "bg-gray-100"
                                  }`}
                                >
                                  <CheckCircle
                                    size={14}
                                    className={
                                      checkin.completed
                                        ? "text-green-600"
                                        : "text-gray-400"
                                    }
                                  />
                                </div>
                                {checkin.completed
                                  ? "Completed"
                                  : "Not completed"}
                              </div>
                            </TableCell>
                            <TableCell>{checkin.notes || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  {!analytics ? (
                    <p className="text-muted-foreground">
                      Analytics data is not available yet. Continue tracking
                      your habit to see insights.
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {/* Overall Completion Rate */}
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Overall Completion
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="p-4 bg-muted rounded-lg text-center">
                            <div className="text-2xl font-bold">
                              {analytics.completion.overall.completedDays}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Days Completed
                            </div>
                          </div>
                          <div className="p-4 bg-muted rounded-lg text-center">
                            <div className="text-2xl font-bold">
                              {analytics.completion.overall.totalDays}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Total Days
                            </div>
                          </div>
                          <div className="p-4 bg-muted rounded-lg text-center">
                            <div className="text-2xl font-bold">
                              {Math.round(analytics.completion.overall.rate)}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Completion Rate
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Completion by Day of Week */}
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Completion by Day
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Your best day is{" "}
                              <span className="font-medium">
                                {analytics.patterns?.bestDay?.day || "N/A"}
                              </span>{" "}
                              with a completion rate of{" "}
                              <span className="font-medium">
                                {Math.round(
                                  analytics.patterns?.bestDay?.rate || 0
                                )}
                                %
                              </span>
                              .
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Your worst day is{" "}
                              <span className="font-medium">
                                {analytics.patterns?.worstDay?.day || "N/A"}
                              </span>{" "}
                              with a completion rate of{" "}
                              <span className="font-medium">
                                {Math.round(
                                  analytics.patterns?.worstDay?.rate || 0
                                )}
                                %
                              </span>
                              .
                            </p>
                          </div>
                          <div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Day</TableHead>
                                  <TableHead className="text-right">
                                    Completion
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {Object.entries(
                                  analytics.completion.byDay || {}
                                ).map(([day, data]) => (
                                  <TableRow key={day}>
                                    <TableCell>{day}</TableCell>
                                    <TableCell className="text-right">
                                      {Math.round(data.rate)}%
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>

                      {/* Premium features teaser */}
                      {!analytics.streakHistory && (
                        <div className="p-4 bg-blue-50 rounded-lg mt-4">
                          <div className="flex items-start gap-3">
                            <BarChart
                              className="text-blue-500 mt-1"
                              size={20}
                            />
                            <div>
                              <h4 className="font-medium text-blue-800">
                                Upgrade to Premium for Advanced Analytics
                              </h4>
                              <p className="text-sm text-blue-700 mt-1">
                                Get access to detailed streak history,
                                consistency scores, and performance predictions.
                              </p>
                              <Button
                                variant="link"
                                asChild
                                className="p-0 h-auto text-blue-600 mt-2"
                              >
                                <Link to="/subscription">Learn more</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Check-in Card (Right Sidebar) */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Track Your Progress</CardTitle>
              <CardDescription>
                Check in to maintain your streak
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Today's completion status */}
              <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Today</span>
                </div>
                <Badge
                  variant={habit.completedToday ? "success" : "outline"}
                  className={
                    habit.completedToday ? "bg-green-100 text-green-800" : ""
                  }
                >
                  {habit.completedToday ? "Completed" : "Not Completed"}
                </Badge>
              </div>

              {/* Check-in form */}
              {!habit.completedToday && !habit.archivedAt && (
                <HabitCheckinForm
                  habitId={habit._id}
                  onCheckinCreated={handleCheckinCreated}
                />
              )}

              {/* Last completed info */}
              {habit.lastCompleted && (
                <div className="text-sm text-muted-foreground mt-4">
                  Last completed:{" "}
                  {format(parseISO(habit.lastCompleted), "MMM d, yyyy")}
                </div>
              )}

              {/* Archived notice */}
              {habit.archivedAt && (
                <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-md text-sm">
                  This habit is archived. Unarchive it to resume tracking.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper function to format frequency
const getFrequencyText = (frequency) => {
  if (!frequency) return "Daily";

  if (frequency.type === "daily") {
    return "Daily";
  } else if (frequency.type === "weekly") {
    const days = frequency.days || [];
    if (days.length === 7) return "Daily";
    if (days.length === 0) return "Weekly";
    if (days.length <= 3) {
      return days.map((day) => day.slice(0, 3)).join(", ");
    }
    return `${days.length} days a week`;
  } else if (frequency.type === "monthly") {
    return `${frequency.days?.length || 0} days a month`;
  }

  return "Custom";
};

// Helper function to format time
const formatTime = (timeString) => {
  if (!timeString) return "";

  try {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);

    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    const formattedMinute = minute.toString().padStart(2, "0");

    return `${formattedHour}:${formattedMinute} ${period}`;
  } catch (error) {
    return timeString;
  }
};

export default HabitDetail;
