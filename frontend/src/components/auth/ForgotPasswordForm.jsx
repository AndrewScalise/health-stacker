import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { forgotPassword } from "@/api/auth.api";

// Form validation schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      await forgotPassword(values.email);
      setIsSubmitted(true);
      toast.success("Password reset instructions sent to your email");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(
        error.message || "Failed to send reset instructions. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Check your email</h3>
        <p className="text-muted-foreground mb-4">
          We've sent password reset instructions to your email address.
        </p>
        <p className="text-sm text-muted-foreground">
          Didn't receive the email?{" "}
          <Button
            variant="link"
            className="p-0 h-auto font-medium"
            onClick={() => form.handleSubmit(onSubmit)()}
            disabled={isLoading}
          >
            Click to resend
          </Button>
        </p>
        <div className="mt-4">
          <Link to="/login" className="text-sm text-primary hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-medium">Forgot your password?</h3>
        <p className="text-sm text-muted-foreground">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send reset instructions"
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
