// src/pages/AchievementsPage.jsx
import React, { useState, useEffect } from "react";
import {
  Award,
  Filter,
  Lock,
  Unlock,
  CheckCircle,
  Calendar,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";

// Mock API call - replace with actual API when available
const fetchAchievements = async () => {
  // Simulating API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock data
  return [
    {
      id: 1,
      name: "First Steps",
      description: "Create your first habit",
      category: "beginner",
      icon: "CheckCircle",
      earnedAt: "2023-12-15T10:30:00Z",
      progress: 100,
      unlocked: true,
    },
    {
      id: 2,
      name: "Consistency Starter",
      description: "Complete a habit for 3 days in a row",
      category: "streak",
      icon: "Activity",
      earnedAt: "2023-12-18T11:45:00Z",
      progress: 100,
      unlocked: true,
    },
    {
      id: 3,
      name: "Week Warrior",
      description: "Complete a habit for 7 days in a row",
      category: "streak",
      icon: "Award",
      earnedAt: "2023-12-22T09:15:00Z",
      progress: 100,
      unlocked: true,
    },
    {
      id: 4,
      name: "Habit Enthusiast",
      description: "Create 5 different habits",
      category: "collection",
      icon: "CheckCircle",
      earnedAt: null,
      progress: 60,
      unlocked: true,
    },
    {
      id: 5,
      name: "Month Master",
      description: "Maintain a 30-day streak on any habit",
      category: "streak",
      icon: "Calendar",
      earnedAt: null,
      progress: 43,
      unlocked: true,
    },
    {
      id: 6,
      name: "Perfect Week",
      description: "Complete all habits every day for a week",
      category: "excellence",
      icon: "Award",
      earnedAt: null,
      progress: 30,
      unlocked: true,
    },
    {
      id: 7,
      name: "Habit Champion",
      description: "Complete a habit 100 times",
      category: "milestone",
      icon: "Award",
      earnedAt: null,
      progress: 67,
      unlocked: true,
    },
    {
      id: 8,
      name: "Data Analyst",
      description: "View all sections of your analytics page",
      category: "engagement",
      icon: "Activity",
      earnedAt: null,
      progress: 0,
      unlocked: true,
    },
    {
      id: 9,
      name: "Social Motivator",
      description: "Join an accountability group",
      category: "social",
      icon: "Users",
      earnedAt: null,
      progress: 0,
      unlocked: false,
      premiumOnly: true,
    },
    {
      id: 10,
      name: "Unstoppable",
      description: "Maintain a 100-day streak",
      category: "excellence",
      icon: "Award",
      earnedAt: null,
      progress: 12,
      unlocked: true,
    },
  ];
};

// Achievement icon mapping
const iconMap = {
  Award: <Award />,
  CheckCircle: <CheckCircle />,
  Calendar: <Calendar />,
  Activity: <Activity />,
  Users: (
    <span className="inline-flex items-center justify-center p-1 rounded-full">
      👥
    </span>
  ),
};

const AchievementsPage = () => {
  const { user } = useAuth();
  const isPremium = user?.subscriptionStatus === "premium";
  const [achievements, setAchievements] = useState([]);
  const [filteredAchievements, setFilteredAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch achievements on component mount
  useEffect(() => {
    const getAchievements = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAchievements();
        setAchievements(data);
        setFilteredAchievements(data);
      } catch (error) {
        console.error("Failed to fetch achievements:", error);
        toast.error("Failed to load achievements. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    getAchievements();
  }, []);

  // Apply filters when achievements, activeTab, searchQuery, or categoryFilter changes
  useEffect(() => {
    applyFilters();
  }, [achievements, activeTab, searchQuery, categoryFilter]);

  // Apply filters to achievements
  const applyFilters = () => {
    let filtered = [...achievements];

    // Filter by tab (all, earned, in-progress)
    if (activeTab === "earned") {
      filtered = filtered.filter((achievement) => achievement.earnedAt);
    } else if (activeTab === "in-progress") {
      filtered = filtered.filter(
        (achievement) =>
          !achievement.earnedAt &&
          achievement.progress > 0 &&
          achievement.unlocked
      );
    } else if (activeTab === "locked") {
      filtered = filtered.filter((achievement) => !achievement.unlocked);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (achievement) =>
          achievement.name.toLowerCase().includes(query) ||
          achievement.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (achievement) => achievement.category === categoryFilter
      );
    }

    setFilteredAchievements(filtered);
  };

  // Get unique categories from achievements
  const getCategories = () => {
    const categories = new Set(
      achievements.map((achievement) => achievement.category)
    );
    return ["all", ...categories];
  };

  // Calculate achievement stats
  const stats = {
    totalAchievements: achievements.length,
    earnedAchievements: achievements.filter((a) => a.earnedAt).length,
    inProgressAchievements: achievements.filter(
      (a) => !a.earnedAt && a.progress > 0 && a.unlocked
    ).length,
    lockedAchievements: achievements.filter((a) => !a.unlocked).length,
  };

  // Format category name
  const formatCategory = (category) => {
    if (category === "all") return "All Categories";
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Render loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Achievements"
        description="Track your progress and unlock achievements"
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAchievements}</div>
            <p className="text-xs text-muted-foreground">Achievements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.earnedAchievements}</div>
            <p className="text-xs text-muted-foreground">
              {(
                (stats.earnedAchievements / stats.totalAchievements) *
                100
              ).toFixed(0)}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.inProgressAchievements}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                (stats.inProgressAchievements / stats.totalAchievements) *
                100
              ).toFixed(0)}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Locked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lockedAchievements}</div>
            <p className="text-xs text-muted-foreground">
              {(
                (stats.lockedAchievements / stats.totalAchievements) *
                100
              ).toFixed(0)}
              % of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Input
            type="search"
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
          <span className="absolute left-2.5 top-2.5 text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter size={16} />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {getCategories().map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={
                      categoryFilter === category ? "bg-accent font-medium" : ""
                    }
                  >
                    {formatCategory(category)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="earned">Earned</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="locked">Locked</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isPremium={isPremium}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="earned" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isPremium={isPremium}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isPremium={isPremium}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="locked" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isPremium={isPremium}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Upgrade Banner (if not premium) */}
      {!isPremium && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
            <div>
              <h3 className="text-lg font-medium text-blue-800">
                Unlock Premium Achievements
              </h3>
              <p className="text-sm text-blue-600">
                Upgrade to premium to unlock additional achievements and
                tracking features.
              </p>
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <a href="/subscription">Upgrade to Premium</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Achievement Card Component
const AchievementCard = ({ achievement, isPremium }) => {
  const {
    name,
    description,
    category,
    icon,
    earnedAt,
    progress,
    unlocked,
    premiumOnly,
  } = achievement;

  const isEarned = !!earnedAt;
  const isLocked = !unlocked;
  const isPremiumLocked = premiumOnly && !isPremium;

  return (
    <Card className={`relative ${isEarned ? "border-amber-200" : ""}`}>
      {/* Premium Badge */}
      {premiumOnly && (
        <Badge
          variant="outline"
          className="absolute top-2 right-2 bg-amber-50 text-amber-800 border-amber-200"
        >
          Premium
        </Badge>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-full ${
                isEarned
                  ? "bg-amber-100 text-amber-600"
                  : isLocked || isPremiumLocked
                  ? "bg-gray-100 text-gray-400"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {isLocked || isPremiumLocked ? (
                <Lock size={20} />
              ) : (
                iconMap[icon] || <Award size={20} />
              )}
            </div>
            <div>
              <CardTitle className="text-base">{name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {formatCategory(category)}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>

        {isEarned ? (
          <div className="mt-3">
            <Badge
              variant="outline"
              className="bg-green-50 text-green-800 border-green-200"
            >
              Earned on {new Date(earnedAt).toLocaleDateString()}
            </Badge>
          </div>
        ) : isLocked || isPremiumLocked ? (
          <div className="mt-3">
            <Badge variant="outline" className="flex items-center gap-1">
              <Lock size={12} />
              {isPremiumLocked ? "Premium Required" : "Locked"}
            </Badge>
          </div>
        ) : (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementsPage;
