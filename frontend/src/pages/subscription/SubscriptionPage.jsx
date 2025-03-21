// src/pages/SubscriptionPage.jsx
import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  checkPremiumAccess,
  createSubscription,
  cancelSubscription,
} from "@/api/subscription.api";
import { toast } from "sonner";

const SubscriptionPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isPremium = user?.subscriptionStatus === "premium";

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // This would open a payment flow in a real app
      await createSubscription({ planId: "premium-monthly" });
      toast.success("Subscription successful! Welcome to Premium!");
      // Reload user data or update locally
      window.location.reload();
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to process subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      await cancelSubscription();
      toast.success(
        "Subscription canceled. You still have access until the end of your billing period."
      );
      // Reload user data or update locally
      window.location.reload();
    } catch (error) {
      console.error("Cancellation error:", error);
      toast.error("Failed to cancel subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-muted-foreground mt-2">
          Choose the right plan for your habit tracking journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Free Plan</span>
              {!isPremium && (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800"
                >
                  Current Plan
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Basic habit tracking</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground"> / month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check size={18} className="mr-2 text-green-600" />
                <span>Track up to 5 habits</span>
              </li>
              <li className="flex items-center">
                <Check size={18} className="mr-2 text-green-600" />
                <span>Basic analytics</span>
              </li>
              <li className="flex items-center">
                <Check size={18} className="mr-2 text-green-600" />
                <span>Calendar view</span>
              </li>
              <li className="flex items-center">
                <X size={18} className="mr-2 text-red-600" />
                <span className="text-muted-foreground">
                  Accountability groups
                </span>
              </li>
              <li className="flex items-center">
                <X size={18} className="mr-2 text-red-600" />
                <span className="text-muted-foreground">
                  Advanced analytics
                </span>
              </li>
              <li className="flex items-center">
                <X size={18} className="mr-2 text-red-600" />
                <span className="text-muted-foreground">Data export</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className={isPremium ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Premium Plan</span>
              {isPremium && (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800"
                >
                  Current Plan
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Advanced habit tracking</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">$9.99</span>
              <span className="text-muted-foreground"> / month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check size={18} className="mr-2 text-green-600" />
                <span>Unlimited habits</span>
              </li>
              <li className="flex items-center">
                <Check size={18} className="mr-2 text-green-600" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center">
                <Check size={18} className="mr-2 text-green-600" />
                <span>Calendar view</span>
              </li>
              <li className="flex items-center">
                <Check size={18} className="mr-2 text-green-600" />
                <span>Accountability groups</span>
              </li>
              <li className="flex items-center">
                <Check size={18} className="mr-2 text-green-600" />
                <span>Trend predictions</span>
              </li>
              <li className="flex items-center">
                <Check size={18} className="mr-2 text-green-600" />
                <span>Data export</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {isPremium ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCancelSubscription}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Cancel Subscription"}
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleSubscribe}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Upgrade to Premium"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>Have questions about our premium plan?</p>
        <p>Email us at support@healthhabittracker.com</p>
      </div>
    </div>
  );
};

export default SubscriptionPage;
