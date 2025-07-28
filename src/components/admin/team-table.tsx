// src/components/admin/team-table.tsx
"use client";

import { useState } from "react";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
import { AddTeamDialog } from "./add-team-dialog";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { EditTeamDialog } from "./edit-team-dialog";
import { deleteTeam } from "@/lib/api";

interface TeamTableProps {
  teams: Team[];
  onTeamAdded: () => void;
}

export function TeamTable({ teams, onTeamAdded }: TeamTableProps) {
  const { toast } = useToast();
  const [showAddTeamDialog, setShowAddTeamDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const openEditDialog = (team: Team) => {
    setSelectedTeam(team);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (team: Team) => {
    setSelectedTeam(team);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTeam) return;

    const success = await deleteTeam(selectedTeam.id);
    if (success) {
      toast({ title: "Team deleted successfully!" });
      onTeamAdded(); // Refresh the list
    } else {
      toast({ title: "Failed to delete team.", variant: "destructive" });
    }
    setShowDeleteDialog(false);
    setSelectedTeam(null);
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
      <EditTeamDialog
        open={showEditDialog}
        setOpen={setShowEditDialog}
        team={selectedTeam}
        onTeamUpdated={() => {
          onTeamAdded(); // Refresh list
          setSelectedTeam(null);
        }}
      />
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        itemName={selectedTeam?.name || ""}
      />

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
                    <DropdownMenuItem onClick={() => openEditDialog(team)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openDeleteDialog(team)}>Delete</DropdownMenuItem>
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
