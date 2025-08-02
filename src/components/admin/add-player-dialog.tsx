// src/components/admin/add-player-dialog.tsx
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addPlayer, fetchTeams } from "@/lib/api";
import { uploadFile } from "@/lib/firebase-storage";
import { Team } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, { message: "Player name must be at least 2 characters." }),
  teamId: z.string({ required_error: "Please select a team." }),
  category: z.string({ required_error: "Please select a category." }),
  basePrice: z.string().min(1, { message: "Base price is required." }),
  preferredPosition: z.string().min(1, { message: "Position is required." }),
  preferredFoot: z.string({ required_error: "Please select a preferred foot." }),
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
  const [teams, setTeams] = useState<Team[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", basePrice: "", preferredPosition: "" },
  });

  useEffect(() => {
    async function getTeams() {
      const fetchedTeams = await fetchTeams();
      setTeams(fetchedTeams);
    }
    if (open) {
      getTeams();
    }
  }, [open]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const avatarUrl = await uploadFile(values.avatar[0], "player-avatars");
      const { avatar, ...playerData } = values;
      const result = await addPlayer({
        ...playerData,
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
            <FormField
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a team" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teams.map(team => <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="5★">5★</SelectItem>
                      <SelectItem value="4★">4★</SelectItem>
                      <SelectItem value="3★">3★</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price</FormLabel>
                  <FormControl><Input placeholder="e.g., 10pts" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Position</FormLabel>
                  <FormControl><Input placeholder="e.g., FW, MID" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredFoot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Foot</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a foot" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="R">Right</SelectItem>
                      <SelectItem value="L">Left</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
