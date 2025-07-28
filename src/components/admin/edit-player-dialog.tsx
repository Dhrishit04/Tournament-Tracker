// src/components/admin/edit-player-dialog.tsx
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
import { updatePlayer } from "@/lib/api";
import { Player } from "@/types";
import { uploadFile } from "@/lib/firebase-storage";

const formSchema = z.object({
  name: z.string().min(2, { message: "Player name must be at least 2 characters." }),
  team: z.string().min(2, { message: "Team name must be at least 2 characters." }),
  category: z.string(),
  basePrice: z.string(),
  preferredPosition: z.string(),
  preferredFoot: z.string(),
  avatar: z.any(), // Avatar is optional when editing
});

interface EditPlayerDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  player: Player | null;
  onPlayerUpdated: () => void;
}

export function EditPlayerDialog({ open, setOpen, player, onPlayerUpdated }: EditPlayerDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (player) {
      form.reset({
        ...player,
        preferredPosition: player.preferredPosition.join(', '),
      });
    }
  }, [player, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!player) return;

    setIsSubmitting(true);
    try {
      let avatarUrl = player.avatarUrl;
      if (values.avatar && values.avatar.length > 0) {
        avatarUrl = await uploadFile(values.avatar[0], "player-avatars");
      }

      const updatedData = {
        ...values,
        avatarUrl,
        preferredPosition: values.preferredPosition.split(',').map(p => p.trim()),
      };
      
      const result = await updatePlayer(player.id, updatedData);
      
      if (result) {
        toast({ title: "Player updated successfully!" });
        setOpen(false);
        onPlayerUpdated();
      } else {
        toast({ title: "Failed to update player", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error updating player:", error);
      toast({ title: "An error occurred.", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Player</DialogTitle>
          <DialogDescription>
            Make changes to the player details. Click save when you're done.
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
                  <FormControl><Input {...field} /></FormControl>
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
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
