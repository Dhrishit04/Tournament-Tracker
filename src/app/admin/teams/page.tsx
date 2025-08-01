// src/app/admin/teams/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamTable } from "@/components/admin/team-table";
import { useTeams } from "@/hooks/use-api";

export default function TeamsAdminPage() {
  const { teams, isLoading, isError, mutate } = useTeams();

  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <p>Loading teams...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <p className="text-red-500">Error: Failed to load teams.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Team Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Teams</CardTitle>
          <CardDescription>
            A list of all the teams in the tournament. You can add, edit, or delete teams from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamTable teams={teams || []} onTeamAdded={mutate} />
        </CardContent>
      </Card>
    </main>
  );
}
