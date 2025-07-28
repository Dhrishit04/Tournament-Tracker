// src/app/admin/players/page.tsx
"use client";

import { useEffect, useState } from "react";
import { PlusCircle, UserSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerTable } from "@/components/admin/player-table";
import { fetchPlayers } from "@/lib/api";
import { Player } from "@/types";

export default function PlayersAdminPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Combined function to fetch and set players
  const getPlayers = async () => {
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
  };

  useEffect(() => {
    getPlayers();
  }, []); // Empty dependency array to run only on mount

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
        <Button className="ml-auto" size="sm" onClick={getPlayers}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Player
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Players</CardTitle>
          <CardDescription>
            A list of all players in the tournament. You can add, edit, or delete players from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerTable players={players} />
        </CardContent>
      </Card>
    </main>
  );
}
