// src/pages/ProfilePage.jsx
import React from "react";
import {
  Award,
  Bell,
  Calendar,
  Edit,
  Settings,
  User,
  BarChart2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { user } = useAuth();

  // Example statistics (would be fetched from the API in a real app)
  const stats = {
    totalHabits: 12,
    completedToday: 8,
    completionRate: 67,
    currentStreak: 14,
    longestStreak: 21,
    totalDaysTracked: 45,
  };

  // Example achievements (would be fetched from the API in a real app)
  const achievements = [
    {
      id: 1,
      name: "First Habit",
      description: "Created your first habit",
      earned: true,
    },
    {
      id: 2,
      name: "Week Warrior",
      description: "Maintained a 7-day streak",
      earned: true,
    },
    {
      id: 3,
      name: "Perfect Week",
      description: "Completed all habits for a full week",
      earned: true,
    },
    {
      id: 4,
      name: "Consistency Master",
      description: "Maintained a 30-day streak",
      earned: false,
    },
    {
      id: 5,
      name: "Habit Champion",
      description: "Completed 100 habits",
      earned: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-xl">
              {user?.firstName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {user?.subscriptionStatus === "premium" ? "Premium" : "Free"}
              </Badge>
              <Badge variant="outline">
                Member since {new Date().getFullYear()}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/settings">
              <Settings size={16} className="mr-2" />
              Settings
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/settings?tab=profile">
              <Edit size={16} className="mr-2" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle size={14} />
              Habit Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="h-1.5 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedToday} of {stats.totalHabits} completed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar size={14} />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              Longest: {stats.longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart2 size={14} />
              Total Days Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDaysTracked}</div>
            <p className="text-xs text-muted-foreground">
              Since {new Date().toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award size={20} />
          Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={!achievement.earned ? "opacity-60" : ""}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>{achievement.name}</span>
                  {achievement.earned ? (
                    <Award size={16} className="text-amber-500" />
                  ) : (
                    <Award size={16} className="text-gray-400" />
                  )}
                </CardTitle>
                <CardDescription>{achievement.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mt-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/habits">
            <CheckCircle size={16} className="mr-2" />
            View Habits
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/analytics">
            <BarChart2 size={16} className="mr-2" />
            View Analytics
          </Link>
        </Button>
        {user?.subscriptionStatus !== "premium" && (
          <Button size="sm" asChild>
            <Link to="/subscription">Upgrade to Premium</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
