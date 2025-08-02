// src/components/admin/add-team-dialog.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Team } from "@/types";
import { API_BASE_URL } from "@/lib/api";
import { useState } from "react";
import { useTeams } from "@/hooks/use-api"; // Import useTeams hook

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }),
  owner: z.string().min(2, {
    message: "Owner name must be at least 2 characters.",
  }),
  logoUrl: z.string().url({
    message: "Logo URL must be a valid URL.",
  }),
});

export function AddTeamDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { mutate: mutateTeams } = useTeams(); // Get the mutate function for teams

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      owner: "",
      logoUrl: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const newTeam: Team = {
        id: "", // ID will be set by the backend
        name: values.name,
        owner: values.owner,
        logoUrl: values.logoUrl,
        players: [], // Initialize with empty players list
        stats: {
          matchesPlayed: 0,
          matchesWon: 0,
          matchesLost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
          rank: 0,
          wins: 0,
        },
      };

      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTeam),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const addedTeam: Team = await response.json();
      console.log("Team added:", addedTeam);

      toast({
        title: "Team Added!",
        description: `Team "${addedTeam.name}" has been successfully added.`,
        variant: "default",
      });

      mutateTeams(); // Revalidate the teams list after adding a new team
      form.reset();
      setOpen(false); // Close the dialog on success
    } catch (error) {
      console.error("Failed to add team:", error);
      toast({
        title: "Error",
        description: `Failed to add team. ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircledIcon className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Team
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Team</DialogTitle>
          <DialogDescription>
            Enter the details for the new team.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Royal Challengers" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., http://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Add Team</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
