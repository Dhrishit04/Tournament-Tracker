// src/components/admin/edit-player-dialog.tsx
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useSWRConfig } from "swr";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updatePlayer, fetchTeams } from "@/lib/api";
import { Player, Team } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, { message: "Player name must be at least 2 characters." }),
  team: z.string({ required_error: "Please select a team." }),
  category: z.string({ required_error: "Please select a category." }),
  basePrice: z.string().min(1, { message: "Base price is required." }),
  preferredPosition: z.string().min(1, { message: "Position is required." }),
  preferredFoot: z.string({ required_error: "Please select a preferred foot." }),
});

interface EditPlayerDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  player: Player | null;
  onPlayerUpdated: () => void;
}

export function EditPlayerDialog({ open, setOpen, player, onPlayerUpdated }: EditPlayerDialogProps) {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    async function getTeams() {
      const fetchedTeams = await fetchTeams();
      setTeams(fetchedTeams);
    }
    if (open) {
      getTeams();
      if (player) {
        form.reset({
          ...player,
          preferredPosition: player.preferredPosition.join(', '),
        });
      }
    }
  }, [player, open, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!player) return;

    setIsSubmitting(true);
    try {
      const result = await updatePlayer(player.id, {
        ...values,
        preferredPosition: values.preferredPosition.split(',').map(p => p.trim()),
      });
      
      if (result) {
        toast({ title: "Player updated successfully!" });
        
        // Revalidate the caches for players and teams
        mutate('api/players');
        mutate('api/teams');

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
            {/* All form fields are included here */}
            <FormField name="name" render={({ field }) => ( <FormItem><FormLabel>Player Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField name="team" render={({ field }) => ( <FormItem><FormLabel>Team</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a team" /></SelectTrigger></FormControl><SelectContent>{teams.map(team => <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
            <FormField name="category" render={({ field }) => ( <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent><SelectItem value="5★">5★</SelectItem><SelectItem value="4★">4★</SelectItem><SelectItem value="3★">3★</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
            <FormField name="basePrice" render={({ field }) => ( <FormItem><FormLabel>Base Price</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField name="preferredPosition" render={({ field }) => ( <FormItem><FormLabel>Preferred Position</FormLabel><FormControl><Input placeholder="e.g., FW, MID" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField name="preferredFoot" render={({ field }) => ( <FormItem><FormLabel>Preferred Foot</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a foot" /></SelectTrigger></FormControl><SelectContent><SelectItem value="R">Right</SelectItem><SelectItem value="L">Left</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
            
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
