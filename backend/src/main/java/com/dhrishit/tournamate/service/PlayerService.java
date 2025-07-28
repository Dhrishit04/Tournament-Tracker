package com.dhrishit.tournamate.service;

import com.dhrishit.tournamate.model.Player;
import com.google.firebase.FirebaseApp;
import com.google.firebase.database.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Service
public class PlayerService {

    private final DatabaseReference databaseReference;
    private final TeamService teamService;

    @Autowired
    public PlayerService(FirebaseApp firebaseApp, TeamService teamService) {
        this.databaseReference = FirebaseDatabase.getInstance(firebaseApp).getReference("players");
        this.teamService = teamService;
    }

    // ... existing getAllPlayers and getPlayerById methods ...

    public Player addPlayer(Player player) throws ExecutionException, InterruptedException {
        String newPlayerId = databaseReference.push().getKey();
        if (newPlayerId == null) {
            throw new IllegalStateException("Could not generate a new player ID.");
        }
        player.setId(newPlayerId);
        CompletableFuture<Void> future = new CompletableFuture<>();
        databaseReference.child(newPlayerId).setValue(player, (databaseError, databaseReference) -> {
            if (databaseError != null) {
                future.completeExceptionally(databaseError.toException());
            } else {
                future.complete(null);
            }
        });
        future.get();
        
        // Add player to the team's roster
        teamService.addPlayerToTeam(player.getTeam(), player);

        return player;
    }

    public boolean deletePlayer(String id) throws ExecutionException, InterruptedException {
        Optional<Player> existingPlayerOptional = getPlayerById(id);

        if (existingPlayerOptional.isPresent()) {
            Player player = existingPlayerOptional.get();
            CompletableFuture<Void> future = new CompletableFuture<>();
            databaseReference.child(id).removeValue((databaseError, databaseReference) -> {
                if (databaseError != null) {
                    future.completeExceptionally(databaseError.toException());
                } else {
                    future.complete(null);
                }
            });
            future.get();

            // Remove player from the team's roster
            teamService.removePlayerFromTeam(player.getTeam(), id);

            return true;
        } else {
            return false;
        }
    }
    
    // ... rest of the existing methods ...
}
