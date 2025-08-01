package com.dhrishit.tournamate.service;

import com.dhrishit.tournamate.model.Player;
import com.dhrishit.tournamate.model.Team;
import com.google.firebase.FirebaseApp;
import com.google.firebase.database.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Service
public class PlayerService {

    private final DatabaseReference playersDatabaseReference; // Reference to the top-level 'players' node
    private final DatabaseReference rootDatabaseReference;    // Reference to the root of the database
    private final TeamService teamService;

    @Autowired
    public PlayerService(FirebaseApp firebaseApp, TeamService teamService) {
        this.rootDatabaseReference = FirebaseDatabase.getInstance(firebaseApp).getReference();
        this.playersDatabaseReference = rootDatabaseReference.child("players");
        this.teamService = teamService;
    }

    public List<Player> getAllPlayers() throws ExecutionException, InterruptedException {
        CompletableFuture<List<Player>> future = new CompletableFuture<>();
        playersDatabaseReference.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                List<Player> players = new ArrayList<>();
                if (dataSnapshot.exists()) {
                    for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                        Player player = snapshot.getValue(Player.class);
                        players.add(player);
                    }
                }
                future.complete(players);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                future.completeExceptionally(databaseError.toException());
            }
        });
        return future.get();
    }

    public Optional<Player> getPlayerById(String id) throws ExecutionException, InterruptedException {
        CompletableFuture<Optional<Player>> future = new CompletableFuture<>();
        playersDatabaseReference.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                if (dataSnapshot.exists()) {
                    future.complete(Optional.ofNullable(dataSnapshot.getValue(Player.class)));
                } else {
                    future.complete(Optional.empty());
                }
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                future.completeExceptionally(databaseError.toException());
            }
        });
        return future.get();
    }

    public Player addPlayer(Player player) throws ExecutionException, InterruptedException {
        String newPlayerId = playersDatabaseReference.push().getKey();
        if (newPlayerId == null) {
            throw new IllegalStateException("Could not generate a new player ID.");
        }
        player.setId(newPlayerId);

        Map<String, Object> updates = new HashMap<>();
        updates.put("/players/" + newPlayerId, player);

        // Add player to the team's roster
        if (player.getTeam() != null && !player.getTeam().isEmpty()) {
            updates.put("/teams/" + player.getTeam() + "/players/" + newPlayerId, player);
        }

        CompletableFuture<Void> future = new CompletableFuture<>();
        rootDatabaseReference.updateChildren(updates, (databaseError, databaseReference) -> {
            if (databaseError != null) {
                future.completeExceptionally(databaseError.toException());
            } else {
                future.complete(null);
            }
        });
        future.get(); // Wait for the atomic update to complete
        return player;
    }

    public Optional<Player> updatePlayer(String id, Player updatedPlayer) throws ExecutionException, InterruptedException {
        Optional<Player> existingPlayerOptional = getPlayerById(id);

        if (existingPlayerOptional.isPresent()) {
            Player existingPlayer = existingPlayerOptional.get();
            updatedPlayer.setId(id);

            Map<String, Object> updates = new HashMap<>();
            updates.put("/players/" + id, updatedPlayer); // Update top-level player

            // Handle team change (remove from old team, add to new team)
            if (!existingPlayer.getTeam().equals(updatedPlayer.getTeam())) {
                // Remove from old team's roster
                if (existingPlayer.getTeam() != null && !existingPlayer.getTeam().isEmpty()) {
                    updates.put("/teams/" + existingPlayer.getTeam() + "/players/" + id, null); // Set to null to remove
                }
                // Add to new team's roster
                if (updatedPlayer.getTeam() != null && !updatedPlayer.getTeam().isEmpty()) {
                    updates.put("/teams/" + updatedPlayer.getTeam() + "/players/" + id, updatedPlayer);
                }
            } else {
                // If team didn't change, just update player within current team's roster
                if (updatedPlayer.getTeam() != null && !updatedPlayer.getTeam().isEmpty()) {
                    updates.put("/teams/" + updatedPlayer.getTeam() + "/players/" + id, updatedPlayer);
                }
            }

            CompletableFuture<Void> future = new CompletableFuture<>();
            rootDatabaseReference.updateChildren(updates, (databaseError, databaseReference) -> {
                if (databaseError != null) {
                    future.completeExceptionally(databaseError.toException());
                } else {
                    future.complete(null);
                }
            });
            future.get(); // Wait for the atomic update to complete
            return Optional.of(updatedPlayer);
        } else {
            return Optional.empty();
        }
    }

    public boolean deletePlayer(String id) throws ExecutionException, InterruptedException {
        Optional<Player> existingPlayerOptional = getPlayerById(id);

        if (existingPlayerOptional.isPresent()) {
            Player player = existingPlayerOptional.get();

            Map<String, Object> updates = new HashMap<>();
            updates.put("/players/" + id, null); // Set to null to remove top-level player

            // Remove player from their team's roster
            if (player.getTeam() != null && !player.getTeam().isEmpty()) {
                updates.put("/teams/" + player.getTeam() + "/players/" + id, null); // Set to null to remove from team
            }

            CompletableFuture<Void> future = new CompletableFuture<>();
            rootDatabaseReference.updateChildren(updates, (databaseError, databaseReference) -> {
                if (databaseError != null) {
                    future.completeExceptionally(databaseError.toException());
                } else {
                    future.complete(null);
                }
            });
            future.get(); // Wait for the atomic update to complete
            return true;
        } else {
            return false;
        }
    }
}
