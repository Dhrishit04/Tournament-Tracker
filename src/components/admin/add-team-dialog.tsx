// src/components/admin/add-team-dialog.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addTeam } from "@/lib/api";

const formSchema = z.object({
  name: z.string().min(2, { message: "Team name must be at least 2 characters." }),
  owner: z.string().min(2, { message: "Owner name must be at least 2 characters." }),
  logoUrl: z.string().url({ message: "Please enter a valid URL for the logo." }),
});

interface AddTeamDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onTeamAdded: () => void; // Callback to refresh the team list
}

export function AddTeamDialog({ open, setOpen, onTeamAdded }: AddTeamDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", owner: "", logoUrl: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const newTeam = { ...values };
      const result = await addTeam(newTeam);
      
      if (result) {
        toast({ title: "Team added successfully!" });
        form.reset();
        setOpen(false);
        onTeamAdded(); // Trigger the refresh callback
      } else {
        toast({ title: "Failed to add team", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error adding team:", error);
      toast({ title: "An error occurred.", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Team</DialogTitle>
          <DialogDescription>
            Enter the details for the new team. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Red Devils" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner</FormLabel>
                  <FormControl><Input placeholder="e.g., Ayush Dongre" {...field} /></FormControl>
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
                  <FormControl><Input placeholder="e.g., /images/teams/rd.png" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Team"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
