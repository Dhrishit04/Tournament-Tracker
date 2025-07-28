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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Team name must be at least 2 characters." }),
  owner: z.string().min(2, { message: "Owner name must be at least 2 characters." }),
  logo: z.any(),
  stats: z.object({
    matchesPlayed: z.number().min(0),
    matchesWon: z.number().min(0),
    matchesLost: z.number().min(0),
    matchesDrawn: z.number().min(0),
    totalGoals: z.number().min(0),
    totalAssists: z.number().min(0),
    cleanSheets: z.number().min(0),
    totalYellowCards: z.number().min(0),
    totalRedCards: z.number().min(0),
  }),
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
      form.reset({ name: team.name, owner: team.owner, stats: team.stats });
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
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
          <DialogDescription>
            Make changes to the team details, stats, and roster. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="owner" render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="logo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Logo</FormLabel>
                  <FormControl><Input type="file" accept="image/png" {...form.register("logo")} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            
            <h3 className="text-lg font-medium">Team Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.keys(team?.stats || {}).map((key) => (
                <FormField key={key} name={`stats.${key}`} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              ))}
            </div>

            <h3 className="text-lg font-medium">Player Roster</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team?.players?.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => console.log('Remove player', player.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
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
