// ConsistencyScore.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const ConsistencyScore = ({ analytics }) => {
  if (!analytics || !analytics.consistency) return null;

  const { score, level, streakFactor, completionFactor, regularityFactor } =
    analytics.consistency;

  // Get level details
  const getLevelDetails = (level) => {
    const levels = {
      beginner: {
        color: "bg-blue-100 text-blue-800",
        description: "Just getting started",
      },
      developing: {
        color: "bg-green-100 text-green-800",
        description: "Building momentum",
      },
      consistent: {
        color: "bg-indigo-100 text-indigo-800",
        description: "Steady progress",
      },
      advanced: {
        color: "bg-purple-100 text-purple-800",
        description: "Strong habit formed",
      },
      master: {
        color: "bg-amber-100 text-amber-800",
        description: "Exceptional consistency",
      },
    };

    return (
      levels[level] || {
        color: "bg-gray-100 text-gray-800",
        description: "Not enough data",
      }
    );
  };

  const levelInfo = getLevelDetails(level);

  // Get factor rating
  const getFactorRating = (factor) => {
    if (factor >= 80) return "Excellent";
    if (factor >= 60) return "Good";
    if (factor >= 40) return "Fair";
    if (factor >= 20) return "Needs Work";
    return "Poor";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Consistency Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className="inline-block p-4 rounded-full bg-gray-100">
              <div className="text-4xl font-bold">{Math.round(score)}</div>
              <div className="text-xs text-muted-foreground">out of 100</div>
            </div>
            <div
              className={`mt-3 inline-block px-3 py-1 rounded-full text-sm font-medium ${levelInfo.color}`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {levelInfo.description}
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <div className="text-sm font-medium">Streak Factor</div>
                <div className="text-sm text-muted-foreground">
                  {getFactorRating(streakFactor)}
                </div>
              </div>
              <Progress value={streakFactor} className="h-2" />
              <div className="mt-1 text-xs text-muted-foreground">
                Based on your current and overall streak patterns
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <div className="text-sm font-medium">Completion Factor</div>
                <div className="text-sm text-muted-foreground">
                  {getFactorRating(completionFactor)}
                </div>
              </div>
              <Progress value={completionFactor} className="h-2" />
              <div className="mt-1 text-xs text-muted-foreground">
                Based on your overall completion rate
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <div className="text-sm font-medium">Regularity Factor</div>
                <div className="text-sm text-muted-foreground">
                  {getFactorRating(regularityFactor)}
                </div>
              </div>
              <Progress value={regularityFactor} className="h-2" />
              <div className="mt-1 text-xs text-muted-foreground">
                Based on how consistent your check-in timing is
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsistencyScore;
