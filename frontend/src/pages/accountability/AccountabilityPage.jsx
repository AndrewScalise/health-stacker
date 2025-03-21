// src/pages/accountability/AccountabilityPage.jsx
import React, { useState, useEffect } from "react";
import { Plus, Users, User, UserPlus, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getGroups,
  createGroup,
  generateInvite,
  joinGroup,
} from "@/api/accountability.api";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "sonner";
import EmptyState from "@/components/layout/EmptyState";
import LoadingSpinner from "@/components/layout/LoadingSpinner";

const AccountabilityPage = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const response = await getGroups();
      setGroups(response.data);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      toast.error("Failed to load accountability groups");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    try {
      await joinGroup(inviteCode);
      toast.success("Successfully joined group!");
      fetchGroups();
      setInviteCode("");
    } catch (error) {
      console.error("Failed to join group:", error);
      toast.error("Invalid invite code or error joining group");
    }
  };

  const handleCreateGroup = () => {
    setShowCreateDialog(true);
  };

  const handleGenerateInvite = async (groupId) => {
    try {
      const response = await generateInvite(groupId);
      // Copy to clipboard
      navigator.clipboard.writeText(response.data.inviteCode);
      toast.success("Invite code copied to clipboard!");
    } catch (error) {
      console.error("Failed to generate invite:", error);
      toast.error("Failed to generate invite code");
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accountability Groups"
        description="Track habits together with friends and stay motivated"
        action={{
          label: "Create Group",
          icon: <Plus size={16} />,
          onClick: handleCreateGroup,
        }}
      />

      {/* Join Group */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus size={18} />
            Join a Group
          </CardTitle>
          <CardDescription>
            Enter an invite code to join an existing accountability group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
            <Button onClick={handleJoinGroup}>Join</Button>
          </div>
        </CardContent>
      </Card>

      {/* Groups Tab */}
      <Tabs defaultValue="my-groups">
        <TabsList>
          <TabsTrigger value="my-groups">My Groups</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="mt-6">
          {groups.length === 0 ? (
            <EmptyState
              title="No groups yet"
              description="You haven't joined any accountability groups yet. Create one or join with an invite code."
              icon={Users}
              actionText="Create Group"
              onAction={handleCreateGroup}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <CardTitle>{group.name}</CardTitle>
                    <CardDescription>
                      {group.members?.length || 0} members
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Habits</h4>
                        {group.habits?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {group.habits.map((habit) => (
                              <Badge key={habit.id} variant="outline">
                                {habit.title}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No habits added yet
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/accountability/${group.id}`}>View Group</a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGenerateInvite(group.id)}
                    >
                      <Share2 size={16} className="mr-1" />
                      Invite
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Discover Groups</CardTitle>
              <CardDescription>
                Find public accountability groups to join
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Public group discovery coming soon!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Group Dialog would go here */}
    </div>
  );
};

export default AccountabilityPage;
