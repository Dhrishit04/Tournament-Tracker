// src/components/admin/player-table.tsx
"use client";

import { useState } from "react";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Player } from "@/types";
import { AddPlayerDialog } from "./add-player-dialog";

interface PlayerTableProps {
  players: Player[];
}

export function PlayerTable({ players }: PlayerTableProps) {
  const [currentPlayers, setCurrentPlayers] = useState<Player[]>(players);
  const [showAddPlayerDialog, setShowAddPlayerDialog] = useState(false);

  // Placeholder for future edit functionality
  const handleEdit = (player: Player) => {
    console.log("Edit player:", player);
    // Here you would typically open a dialog or form
  };

  // Placeholder for future delete functionality
  const handleDelete = (playerId: string) => {
    console.log("Delete player with ID:", playerId);
    // Here you would call the API to delete the player
    // For now, we just filter it out of the local state
    setCurrentPlayers((prevPlayers) => prevPlayers.filter((p) => p.id !== playerId));
  };

  return (
    <div>
        <Button onClick={() => setShowAddPlayerDialog(true)}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary/50"
        ><PlusCircle className="h-4 w-4 mr-2" /> Add Player</Button>
      <AddPlayerDialog open={showAddPlayerDialog} setOpen={setShowAddPlayerDialog} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Goals</TableHead>
            <TableHead>Assists</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentPlayers.map((player) => (
            <TableRow key={player.id}>
              <TableCell>
                <Avatar className="h-9 w-9">
                  <Image
                    src={`/images/players/player-${player.id}.png`}
                    alt={`${player.name} avatar`}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://picsum.photos/seed/${player.id}/40/40`;
                    }}
                  />
                  <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{player.name}</TableCell>
              <TableCell>{player.team}</TableCell>
              <TableCell>
                <Badge variant="outline">{player.category}</Badge>
              </TableCell>
              <TableCell>{player.preferredPosition.join(', ')}</TableCell>
              <TableCell>{player.goals ?? 0}</TableCell>
              <TableCell>{player.assists ?? 0}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleEdit(player)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(player.id)}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
