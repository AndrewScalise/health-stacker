import React from "react";
import "./App.css";
import { Button } from "@/components/ui/button";

function App() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Health Habit Tracker</h1>
      <p className="mb-4">Your personalized habit tracking application</p>
      <Button className="bg-blue-500 hover:bg-blue-600 text-white">
        Get Started
      </Button>
    </div>
  );
}

export default App;
