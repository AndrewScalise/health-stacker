import React, { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import HabitForm from "./HabitForm";
import { updateHabit } from "@/api/habits.api";

const HabitEditDialog = ({ habit, open, onOpenChange, onHabitUpdated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await updateHabit(habit._id, formData);
      if (onHabitUpdated) {
        onHabitUpdated(response.data);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update habit:", error);
      toast.error(error.message || "Failed to update habit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogDescription>
            Update the details of your habit to better suit your needs.
          </DialogDescription>
        </DialogHeader>
        <HabitForm
          habit={habit}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default HabitEditDialog;
