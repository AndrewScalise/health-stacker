import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar, RotateCcw } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Form validation schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  category: z.string().min(1, "Please select a category"),
  frequency: z.object({
    type: z.enum(["daily", "weekly", "specific_days"]),
    timesPerPeriod: z.number().optional(),
    specificDays: z.array(z.number()).optional(),
  }),
  reminderTime: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

const HabitForm = ({ habit, onSubmit, isSubmitting }) => {
  // Initialize form with existing habit data or defaults
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: habit
      ? {
          ...habit,
          // Ensure nested objects are properly initialized
          frequency: habit.frequency || { type: "daily" },
        }
      : {
          title: "",
          description: "",
          category: "exercise",
          frequency: {
            type: "daily",
            timesPerPeriod: 1,
            specificDays: [],
          },
          reminderTime: "09:00",
          color: "#4CAF50",
          icon: "check",
        },
  });

  // Categories for the select dropdown
  const categories = [
    { value: "exercise", label: "Exercise" },
    { value: "nutrition", label: "Nutrition" },
    { value: "mindfulness", label: "Mindfulness" },
    { value: "learning", label: "Learning" },
    { value: "productivity", label: "Productivity" },
    { value: "sleep", label: "Sleep" },
    { value: "social", label: "Social" },
    { value: "other", label: "Other" },
  ];

  // Days for specific days selection
  const daysOfWeek = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  // Form submission handler
  const handleSubmit = (values) => {
    onSubmit(values);
  };

  // Reset form handler
  const handleReset = () => {
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Morning Meditation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., 10 minutes of mindfulness meditation each morning"
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Field */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Frequency Type Field */}
        <FormField
          control={form.control}
          name="frequency.type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Frequency</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="daily" />
                    </FormControl>
                    <FormLabel className="font-normal">Daily</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="weekly" />
                    </FormControl>
                    <FormLabel className="font-normal">Weekly</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="specific_days" />
                    </FormControl>
                    <FormLabel className="font-normal">Specific days</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditional fields based on frequency type */}
        {form.watch("frequency.type") === "weekly" && (
          <FormField
            control={form.control}
            name="frequency.timesPerPeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Times per week</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={7}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    value={field.value || 1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch("frequency.type") === "specific_days" && (
          <FormField
            control={form.control}
            name="frequency.specificDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select days</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {daysOfWeek.map((day) => (
                    <FormItem
                      key={day.value}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(day.value)}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            const newValue = checked
                              ? [...currentValue, day.value]
                              : currentValue.filter((val) => val !== day.value);
                            field.onChange(newValue);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{day.label}</FormLabel>
                    </FormItem>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Reminder Time Field */}
        <FormField
          control={form.control}
          name="reminderTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reminder Time (Optional)</FormLabel>
              <FormControl>
                <Input type="time" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>
                Set a daily reminder for this habit.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : habit
              ? "Update Habit"
              : "Create Habit"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default HabitForm;
