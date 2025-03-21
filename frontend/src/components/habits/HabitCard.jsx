import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  Calendar,
  MoreHorizontal,
  Award,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createCheckin } from "@/api/habits.api";
import HabitDeleteDialog from "./HabitDeleteDialog";
import HabitEditDialog from "./HabitEditDialog";

const HabitCard = ({ habit, onUpdate, onDelete, onArchive, onComplete }) => {
  const navigate = useNavigate();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Format last completed date
  const getLastCompletedText = () => {
    if (!habit.lastCompleted) return "Not completed yet";
    return `Last completed ${formatDistanceToNow(
      new Date(habit.lastCompleted),
      { addSuffix: true }
    )}`;
  };

  // Handle completing habit
  const handleComplete = async () => {
    if (habit.completedToday) return;

    setIsCompleting(true);
    try {
      const date = new Date().toISOString();
      const response = await createCheckin(habit._id, {
        date,
        completed: true,
      });

      toast.success("Habit completed for today!");

      // Call the onComplete callback with updated habit data
      if (onComplete) {
        onComplete({
          ...habit,
          completedToday: true,
          lastCompleted: date,
          streak: response.streak,
        });
      }
    } catch (error) {
      console.error("Failed to complete habit:", error);
      toast.error("Failed to complete habit. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  // Handle view details
  const handleViewDetails = () => {
    navigate(`/habits/${habit._id}`);
  };

  // Calculate color based on category
  const getCategoryColor = () => {
    switch (habit.category) {
      case "exercise":
        return "border-l-green-500";
      case "nutrition":
        return "border-l-blue-500";
      case "mindfulness":
        return "border-l-purple-500";
      case "learning":
        return "border-l-amber-500";
      case "productivity":
        return "border-l-cyan-500";
      default:
        return "border-l-slate-500";
    }
  };

  // Get icon based on category
  const getCategoryIcon = () => {
    const iconSize = 16;
    switch (habit.category) {
      case "exercise":
        return <ActivityIcon size={iconSize} />;
      case "nutrition":
        return <UtensilsIcon size={iconSize} />;
      case "mindfulness":
        return <BrainIcon size={iconSize} />;
      case "learning":
        return <BookIcon size={iconSize} />;
      case "productivity":
        return <ChecklistIcon size={iconSize} />;
      default:
        return <StarIcon size={iconSize} />;
    }
  };

  return (
    <>
      <Card className={`mb-4 border-l-4 ${getCategoryColor()}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-lg font-medium" onClick={handleViewDetails}>
                  {habit.title}
                </h3>
                {habit.streak?.current > 0 && (
                  <Badge
                    variant="outline"
                    className="ml-2 flex items-center gap-1 bg-amber-50"
                  >
                    <Award size={12} className="text-amber-500" />
                    <span>{habit.streak.current} day streak</span>
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                {habit.description || "No description"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant={habit.completedToday ? "default" : "outline"}
                size="icon"
                disabled={isCompleting || habit.completedToday}
                onClick={handleComplete}
                className={
                  habit.completedToday ? "bg-green-500 hover:bg-green-600" : ""
                }
              >
                <CheckCircle size={18} />
                <span className="sr-only">Complete</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal size={18} />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleViewDetails}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onArchive && onArchive(habit)}
                  >
                    {habit.archivedAt ? "Unarchive" : "Archive"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {getLastCompletedText()}
              </span>
              <span>
                {habit.completionRate
                  ? `${Math.round(habit.completionRate * 100)}% completion`
                  : "No data yet"}
              </span>
            </div>
            <Progress
              value={habit.completionRate ? habit.completionRate * 100 : 0}
              className="h-1.5"
            />
          </div>
        </CardContent>
        <CardFooter className="px-4 py-2 border-t bg-muted/50 flex justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge
              variant="outline"
              className="flex items-center gap-1 capitalize font-normal"
            >
              {getCategoryIcon()}
              {habit.category || "uncategorized"}
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-1 font-normal"
            >
              <Calendar size={12} />
              {getFrequencyText(habit.frequency)}
            </Badge>
          </div>
          <div>
            {habit.archivedAt && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 font-normal"
              >
                <BookmarkCheck size={12} />
                Archived
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <HabitEditDialog
        habit={habit}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onHabitUpdated={(updatedHabit) => {
          if (onUpdate) onUpdate(updatedHabit);
          setShowEditDialog(false);
        }}
      />

      {/* Delete Dialog */}
      <HabitDeleteDialog
        habit={habit}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onHabitDeleted={() => {
          if (onDelete) onDelete(habit._id);
          setShowDeleteDialog(false);
        }}
      />
    </>
  );
};

// Helper function to get human-readable frequency text
const getFrequencyText = (frequency) => {
  if (!frequency) return "Daily";

  switch (frequency.type) {
    case "daily":
      return "Daily";
    case "weekly":
      return frequency.timesPerPeriod > 1
        ? `${frequency.timesPerPeriod}x a week`
        : "Weekly";
    case "specific_days":
      if (!frequency.specificDays || frequency.specificDays.length === 0)
        return "Daily";
      if (frequency.specificDays.length === 7) return "Daily";

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      if (frequency.specificDays.length <= 2) {
        return frequency.specificDays.map((day) => days[day]).join(", ");
      }
      return `${frequency.specificDays.length} days a week`;
    default:
      return "Daily";
  }
};

// Placeholder icons (replace with actual imports)
const ActivityIcon = ({ size }) => <span className="text-green-500">●</span>;
const UtensilsIcon = ({ size }) => <span className="text-blue-500">●</span>;
const BrainIcon = ({ size }) => <span className="text-purple-500">●</span>;
const BookIcon = ({ size }) => <span className="text-amber-500">●</span>;
const ChecklistIcon = ({ size }) => <span className="text-cyan-500">●</span>;
const StarIcon = ({ size }) => <span className="text-slate-500">●</span>;

export default HabitCard;
