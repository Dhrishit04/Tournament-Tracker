// src/components/admin/edit-team-dialog.tsx
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateTeam } from "@/lib/api";
import { Team } from "@/types";
import { uploadFile } from "@/lib/firebase-storage";

const formSchema = z.object({
  name: z.string().min(2, { message: "Team name must be at least 2 characters." }),
  owner: z.string().min(2, { message: "Owner name must be at least 2 characters." }),
  logo: z.any(), // Allow any file type
});

interface EditTeamDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  team: Team | null;
  onTeamUpdated: () => void;
}

export function EditTeamDialog({ open, setOpen, team, onTeamUpdated }: EditTeamDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (team) {
      form.reset({ name: team.name, owner: team.owner });
    }
  }, [team, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!team) return;

    setIsSubmitting(true);
    try {
      let logoUrl = team.logoUrl;
      if (values.logo && values.logo.length > 0) {
        logoUrl = await uploadFile(values.logo[0], "team-logos");
      }

      const result = await updateTeam(team.id, { ...values, logoUrl });
      
      if (result) {
        toast({ title: "Team updated successfully!" });
        setOpen(false);
        onTeamUpdated();
      } else {
        toast({ title: "Failed to update team", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error updating team:", error);
      toast({ title: "An error occurred.", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
          <DialogDescription>
            Make changes to the team details. Click save when you're done.
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
                  <FormControl><Input {...field} /></FormControl>
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
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Logo</FormLabel>
                  <FormControl><Input type="file" accept="image/png" {...form.register("logo")} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
