// src/app/admin/players/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerTable } from "@/components/admin/player-table";
import { usePlayers } from "@/hooks/use-api";
import { UserSquare } from "lucide-react";

export default function PlayersAdminPage() {
  const { players, isLoading, isError, mutate } = usePlayers();

  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <p>Loading players...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <p className="text-red-500">Error: Failed to load players.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl flex items-center gap-2">
          <UserSquare className="w-6 h-6" />
          Player Management
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Players</CardTitle>
          <CardDescription>
            A list of all players in the tournament. You can add, edit, or delete players from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerTable players={players || []} onPlayerAdded={mutate} />
        </CardContent>
      </Card>
    </main>
  );
}
