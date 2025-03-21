// src/pages/habits/HabitsPage.jsx
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layout/PageHeader";
import HabitList from "@/components/habits/HabitList";
import HabitCreateDialog from "@/components/habits/HabitCreateDialog";
import { useState } from "react";

const HabitsPage = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Habits"
        description="View and manage all your habits"
        action={{
          label: "Create Habit",
          icon: <Plus size={16} />,
          onClick: () => setShowCreateDialog(true),
        }}
      />

      <HabitList onCreateClick={() => setShowCreateDialog(true)} />

      <HabitCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onHabitCreated={() => setShowCreateDialog(false)}
      />
    </div>
  );
};

export default HabitsPage;
