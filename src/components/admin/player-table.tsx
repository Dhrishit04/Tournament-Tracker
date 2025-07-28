// src/components/admin/player-table.tsx
"use client";

import { useState } from "react";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import Image from "next/image";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Player } from "@/types";
import { AddPlayerDialog } from "./add-player-dialog";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { EditPlayerDialog } from "./edit-player-dialog";
import { deletePlayer } from "@/lib/api";

interface PlayerTableProps {
  players: Player[];
  onPlayerAdded: () => void;
}

export function PlayerTable({ players, onPlayerAdded }: PlayerTableProps) {
  const { toast } = useToast();
  const [showAddPlayerDialog, setShowAddPlayerDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const openEditDialog = (player: Player) => {
    setSelectedPlayer(player);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (player: Player) => {
    setSelectedPlayer(player);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPlayer) return;

    const success = await deletePlayer(selectedPlayer.id);
    if (success) {
      toast({ title: "Player deleted successfully!" });
      onPlayerAdded(); // Refresh the list
    } else {
      toast({ title: "Failed to delete player.", variant: "destructive" });
    }
    setShowDeleteDialog(false);
    setSelectedPlayer(null);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAddPlayerDialog(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Player
        </Button>
      </div>
      <AddPlayerDialog open={showAddPlayerDialog} setOpen={setShowAddPlayerDialog} onPlayerAdded={onPlayerAdded} />
      <EditPlayerDialog
        open={showEditDialog}
        setOpen={setShowEditDialog}
        player={selectedPlayer}
        onPlayerUpdated={() => {
          onPlayerAdded(); // Refresh list
          setSelectedPlayer(null);
        }}
      />
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        itemName={selectedPlayer?.name || ""}
      />

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
          {players.map((player) => (
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
                    <DropdownMenuItem onClick={() => openEditDialog(player)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openDeleteDialog(player)}>Delete</DropdownMenuItem>
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
