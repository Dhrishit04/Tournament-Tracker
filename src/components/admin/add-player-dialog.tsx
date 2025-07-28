// src/components/admin/add-player-dialog.tsx
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
import { addPlayer } from "@/lib/api";
import { uploadFile } from "@/lib/firebase-storage";

const formSchema = z.object({
  name: z.string().min(2, { message: "Player name must be at least 2 characters." }),
  team: z.string().min(2, { message: "Team name must be at least 2 characters." }),
  category: z.string(),
  basePrice: z.string(),
  preferredPosition: z.string(),
  preferredFoot: z.string(),
  avatar: z.any().refine((files) => files?.length == 1, "Player avatar is required."),
});

interface AddPlayerDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onPlayerAdded: () => void;
}

export function AddPlayerDialog({ open, setOpen, onPlayerAdded }: AddPlayerDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", team: "", category: "", basePrice: "", preferredPosition: "", preferredFoot: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const avatarUrl = await uploadFile(values.avatar[0], "player-avatars");
      const result = await addPlayer({
        ...values,
        avatarUrl,
        preferredPosition: values.preferredPosition.split(',').map(p => p.trim()),
        remarks: [],
      });
      
      if (result) {
        toast({ title: "Player added successfully!" });
        form.reset();
        setOpen(false);
        onPlayerAdded();
      } else {
        toast({ title: "Failed to add player", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error adding player:", error);
      toast({ title: "An error occurred.", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Player</DialogTitle>
          <DialogDescription>
            Enter the details for the new player. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Player Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Lionel Messi" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Player Avatar</FormLabel>
                  <FormControl><Input type="file" accept="image/png" {...form.register("avatar")} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* ... other form fields ... */}
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Player"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
