// src/components/admin/add-team-dialog.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useSWRConfig } from "swr";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addTeam } from "@/lib/api";
import { uploadFile } from "@/lib/firebase-storage";

const formSchema = z.object({
  name: z.string().min(2, { message: "Team name must be at least 2 characters." }),
  owner: z.string().min(2, { message: "Owner name must be at least 2 characters." }),
  logo: z.any().refine((files) => files?.length == 1, "Team logo is required."),
});

interface AddTeamDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onTeamAdded: () => void;
}

export function AddTeamDialog({ open, setOpen, onTeamAdded }: AddTeamDialogProps) {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", owner: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const logoUrl = await uploadFile(values.logo[0], "team-logos");
      const result = await addTeam({ ...values, logoUrl });
      
      if (result) {
        toast({ title: "Team added successfully!" });
        mutate('api/teams');
        form.reset();
        setOpen(false);
        onTeamAdded();
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
                {isSubmitting ? "Saving..." : "Save Team"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
