import React, { useState, useEffect } from "react";
import { Plus, Filter, Archive } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

import HabitCard from "./HabitCard";
import HabitCreateDialog from "./HabitCreateDialog";
import EmptyState from "@/components/Layout/EmptyState";
import LoadingSpinner from "@/components/Layout/LoadingSpinner";
import { getHabits, archiveHabit, unarchiveHabit } from "@/api/habits.api";

const HabitList = () => {
  const [habits, setHabits] = useState([]);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch habits on component mount
  useEffect(() => {
    fetchHabits();
  }, []);

  // Apply filters when habits, activeTab, searchQuery, or categoryFilter changes
  useEffect(() => {
    applyFilters();
  }, [habits, activeTab, searchQuery, categoryFilter]);

  // Fetch habits from API
  const fetchHabits = async () => {
    setIsLoading(true);
    try {
      const response = await getHabits();
      setHabits(response.data);
    } catch (error) {
      console.error("Failed to fetch habits:", error);
      toast.error("Failed to load habits. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to habits
  const applyFilters = () => {
    let filtered = [...habits];

    // Filter by tab (all, active, archived)
    if (activeTab === "active") {
      filtered = filtered.filter((habit) => !habit.archivedAt);
    } else if (activeTab === "archived") {
      filtered = filtered.filter((habit) => habit.archivedAt);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (habit) =>
          habit.title.toLowerCase().includes(query) ||
          (habit.description && habit.description.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((habit) => habit.category === categoryFilter);
    }

    setFilteredHabits(filtered);
  };

  // Handle habit creation
  const handleHabitCreated = (newHabit) => {
    setHabits((prevHabits) => [...prevHabits, newHabit]);
    toast.success("Habit created successfully!");
  };

  // Handle habit update
  const handleHabitUpdated = (updatedHabit) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit._id === updatedHabit._id ? updatedHabit : habit
      )
    );
    toast.success("Habit updated successfully!");
  };

  // Handle habit deletion
  const handleHabitDeleted = (habitId) => {
    setHabits((prevHabits) =>
      prevHabits.filter((habit) => habit._id !== habitId)
    );
    toast.success("Habit deleted successfully!");
  };

  // Handle habit archive/unarchive
  const handleArchiveToggle = async (habit) => {
    try {
      let response;
      if (habit.archivedAt) {
        response = await unarchiveHabit(habit._id);
        toast.success("Habit unarchived successfully!");
      } else {
        response = await archiveHabit(habit._id);
        toast.success("Habit archived successfully!");
      }

      setHabits((prevHabits) =>
        prevHabits.map((h) => (h._id === habit._id ? response.data : h))
      );
    } catch (error) {
      console.error("Failed to archive/unarchive habit:", error);
      toast.error("Failed to update habit. Please try again.");
    }
  };

  // Handle habit completion
  const handleHabitCompleted = (updatedHabit) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit._id === updatedHabit._id ? updatedHabit : habit
      )
    );
  };

  // Get unique categories from habits
  const getCategories = () => {
    const categories = new Set(
      habits.map((habit) => habit.category).filter(Boolean)
    );
    return ["all", ...categories];
  };

  // Render loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Input
            type="search"
            placeholder="Search habits..."
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
                    {category === "all"
                      ? "All Categories"
                      : category.charAt(0).toUpperCase() + category.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setShowCreateDialog(true)}
            size="sm"
            className="gap-1"
          >
            <Plus size={16} />
            <span>New Habit</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Habits</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {filteredHabits.length === 0 ? (
            <EmptyState
              title="No habits found"
              description={
                searchQuery || categoryFilter !== "all"
                  ? "No habits match your filters. Try adjusting your criteria."
                  : "You haven't created any habits yet. Get started by creating your first habit."
              }
              icon={Filter}
              actionText={
                searchQuery || categoryFilter !== "all"
                  ? "Clear filters"
                  : "Create habit"
              }
              onAction={
                searchQuery || categoryFilter !== "all"
                  ? () => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                    }
                  : () => setShowCreateDialog(true)
              }
            />
          ) : (
            filteredHabits.map((habit) => (
              <HabitCard
                key={habit._id}
                habit={habit}
                onUpdate={handleHabitUpdated}
                onDelete={handleHabitDeleted}
                onArchive={handleArchiveToggle}
                onComplete={handleHabitCompleted}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          {filteredHabits.length === 0 ? (
            <EmptyState
              title="No active habits"
              description={
                searchQuery || categoryFilter !== "all"
                  ? "No active habits match your filters."
                  : "You don't have any active habits. Create a new habit or unarchive an existing one."
              }
              icon={Plus}
              actionText="Create habit"
              onAction={() => setShowCreateDialog(true)}
            />
          ) : (
            filteredHabits.map((habit) => (
              <HabitCard
                key={habit._id}
                habit={habit}
                onUpdate={handleHabitUpdated}
                onDelete={handleHabitDeleted}
                onArchive={handleArchiveToggle}
                onComplete={handleHabitCompleted}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          {filteredHabits.length === 0 ? (
            <EmptyState
              title="No archived habits"
              description="You don't have any archived habits."
              icon={Archive}
            />
          ) : (
            filteredHabits.map((habit) => (
              <HabitCard
                key={habit._id}
                habit={habit}
                onUpdate={handleHabitUpdated}
                onDelete={handleHabitDeleted}
                onArchive={handleArchiveToggle}
                onComplete={handleHabitCompleted}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Create Habit Dialog */}
      <HabitCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onHabitCreated={handleHabitCreated}
      />
    </div>
  );
};

export default HabitList;
