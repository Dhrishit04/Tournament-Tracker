// src/app/admin/players/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { UserSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerTable } from "@/components/admin/player-table";
import { fetchPlayers } from "@/lib/api";
import { Player } from "@/types";

export default function PlayersAdminPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use useCallback to memoize the fetch function
  const getPlayers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPlayers();
      setPlayers(data);
      setError(null);
    } catch (err) {
      setError("Failed to load players.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getPlayers();
  }, [getPlayers]);

  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <p>Loading players...</p>
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
        <h1 className="font-semibold text-lg md:text-2xl flex items-center gap-2">
          <UserSquare className="w-6 h-6" />
          Player Management
        </h1>
        {/* The "Add Player" button is now managed within the PlayerTable component */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Players</CardTitle>
          <CardDescription>
            A list of all players in the tournament. You can add, edit, or delete players from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerTable players={players} onPlayerAdded={getPlayers} />
        </CardContent>
      </Card>
    </main>
  );
}
