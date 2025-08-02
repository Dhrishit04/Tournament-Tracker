// src/components/admin/edit-team-dialog.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
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
import { Team, TeamStats } from "@/types";
import { API_BASE_URL } from "@/lib/api";
import { useTeam, useTeams } from "@/hooks/use-api";

// Combined schema for team details and stats
const formSchema = z.object({
  name: z.string().min(2, { message: "Team name must be at least 2 characters." }),
  owner: z.string().min(2, { message: "Owner name must be at least 2 characters." }),
  logoUrl: z.string().url({ message: "Logo URL must be a valid URL." }),
  matchesPlayed: z.coerce.number().min(0).default(0),
  matchesWon: z.coerce.number().min(0).default(0),
  matchesLost: z.coerce.number().min(0).default(0),
  goalsFor: z.coerce.number().min(0).default(0),
  goalsAgainst: z.coerce.number().min(0).default(0),
  goalDifference: z.coerce.number().default(0),
  points: z.coerce.number().default(0),
  rank: z.coerce.number().default(0),
  wins: z.coerce.number().min(0).default(0),
});

interface EditTeamDialogProps {
  team: Team;
}

export function EditTeamDialog({ team }: EditTeamDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { mutate: mutateTeamsList } = useTeams();
  const { mutate: mutateSingleTeam } = useTeam(team.id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (team) {
      form.reset({
        name: team.name,
        owner: team.owner,
        logoUrl: team.logoUrl,
        matchesPlayed: team.stats?.matchesPlayed ?? 0,
        matchesWon: team.stats?.matchesWon ?? 0,
        matchesLost: team.stats?.matchesLost ?? 0,
        goalsFor: team.stats?.goalsFor ?? 0,
        goalsAgainst: team.stats?.goalsAgainst ?? 0,
        goalDifference: team.stats?.goalDifference ?? 0,
        points: team.stats?.points ?? 0,
        rank: team.stats?.rank ?? 0,
        wins: team.stats?.wins ?? 0,
      });
    }
  }, [team, form, open]); // Reset form when dialog opens or team data changes

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const updatedTeam: Team = {
        ...team, // Retain existing properties like id and players
        name: values.name,
        owner: values.owner,
        logoUrl: values.logoUrl,
        stats: {
          matchesPlayed: values.matchesPlayed,
          matchesWon: values.matchesWon,
          matchesLost: values.matchesLost,
          goalsFor: values.goalsFor,
          goalsAgainst: values.goalsAgainst,
          goalDifference: values.goalDifference,
          points: values.points,
          rank: values.rank,
          wins: values.wins,
        } as TeamStats,
      };

      const response = await fetch(`${API_BASE_URL}/teams/${team.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTeam),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Team Updated!",
        description: `Team "${updatedTeam.name}" has been successfully updated.`,
      });

      // Trigger revalidation of SWR caches
      await mutateTeamsList();
      await mutateSingleTeam();
      
      setOpen(false);
    } catch (error) {
      console.error("Failed to update team:", error);
      toast({
        title: "Error",
        description: `Failed to update team. ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Team: {team.name}</DialogTitle>
          <DialogDescription>
            Make changes to the team details and stats. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Team Details</h4>
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="owner" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="logoUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              {/* Team Stats */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Team Statistics</h4>
                <FormField control={form.control} name="matchesPlayed" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matches Played</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="matchesWon" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matches Won</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="matchesLost" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matches Lost</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="goalsFor" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goals For</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="goalsAgainst" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goals Against</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="points" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
