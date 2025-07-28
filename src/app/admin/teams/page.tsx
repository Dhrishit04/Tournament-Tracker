// src/app/admin/teams/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamTable } from "@/components/admin/team-table";
import { fetchTeams } from "@/lib/api";
import { Team } from "@/types";

export default function TeamsAdminPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTeams = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchTeams();
      setTeams(data);
      setError(null);
    } catch (err) {
      setError("Failed to load teams.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getTeams();
  }, [getTeams]);

  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <p>Loading teams...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <p className="text-red-500">Error: {error}</p>
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
          <TeamTable teams={teams} onTeamAdded={getTeams} />
        </CardContent>
      </Card>
    </main>
  );
}
