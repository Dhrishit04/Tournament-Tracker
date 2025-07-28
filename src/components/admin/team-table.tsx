// src/components/admin/team-table.tsx
"use client";

import { useState } from "react";
import { MoreHorizontal, PlusCircle } from "lucide-react";

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
import { Team } from "@/types";
import { AddTeamDialog } from "./add-team-dialog"; // Import the new dialog

interface TeamTableProps {
  teams: Team[];
  onTeamAdded: () => void; // Callback to refresh the team list
}

export function TeamTable({ teams, onTeamAdded }: TeamTableProps) {
  const [showAddTeamDialog, setShowAddTeamDialog] = useState(false);

  // Handle edit operation (placeholder for now)
  const handleEdit = (team: Team) => {
    console.log("Edit team:", team);
    // Implement dialog/form opening for editing
  };

  // Handle delete operation (placeholder for now)
  const handleDelete = (teamId: string) => {
    console.log("Delete team with ID:", teamId);
    // Implement actual deletion logic, then update state
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAddTeamDialog(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Team
        </Button>
      </div>
      <AddTeamDialog open={showAddTeamDialog} setOpen={setShowAddTeamDialog} onTeamAdded={onTeamAdded} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Players</TableHead>
            <TableHead>Matches Played</TableHead>
            <TableHead>Wins</TableHead>
            <TableHead>Losses</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell>
                {team.logoUrl && (
                  <img src={team.logoUrl} alt={team.name} className="h-8 w-8 object-contain rounded-full" />
                )}
              </TableCell>
              <TableCell className="font-medium">{team.name}</TableCell>
              <TableCell>{team.owner}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {team.players && team.players.map((player) => (
                    <Badge key={player.id} variant="secondary">
                      {player.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>{team.stats?.matchesPlayed ?? 0}</TableCell>
              <TableCell>{team.stats?.matchesWon ?? 0}</TableCell>
              <TableCell>{team.stats?.matchesLost ?? 0}</TableCell>
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
                    <DropdownMenuItem onClick={() => handleEdit(team)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(team.id)}>Delete</DropdownMenuItem>
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
