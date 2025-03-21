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
import { createHabit } from "@/api/habits.api";

const HabitCreateDialog = ({ open, onOpenChange, onHabitCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await createHabit(formData);
      if (onHabitCreated) {
        onHabitCreated(response.data);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create habit:", error);
      toast.error(error.message || "Failed to create habit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
          <DialogDescription>
            Create a new habit to track in your daily routine. Fill out the
            details below to get started.
          </DialogDescription>
        </DialogHeader>
        <HabitForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
};

export default HabitCreateDialog;
