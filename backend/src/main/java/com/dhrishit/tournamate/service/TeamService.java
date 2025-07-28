package com.dhrishit.tournamate.service;

import com.dhrishit.tournamate.model.Player;
import com.dhrishit.tournamate.model.Team;
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
public class TeamService {

    private final DatabaseReference databaseReference;

    @Autowired
    public TeamService(FirebaseApp firebaseApp) {
        this.databaseReference = FirebaseDatabase.getInstance(firebaseApp).getReference("teams");
    }

    // ... existing methods ...

    public void addPlayerToTeam(String teamId, Player player) throws ExecutionException, InterruptedException {
        CompletableFuture<Void> future = new CompletableFuture<>();
        databaseReference.child(teamId).child("players").child(player.getId()).setValue(player, (databaseError, databaseReference) -> {
            if (databaseError != null) {
                future.completeExceptionally(databaseError.toException());
            } else {
                future.complete(null);
            }
        });
        future.get();
    }

    public void removePlayerFromTeam(String teamId, String playerId) throws ExecutionException, InterruptedException {
        CompletableFuture<Void> future = new CompletableFuture<>();
        databaseReference.child(teamId).child("players").child(playerId).removeValue((databaseError, databaseReference) -> {
            if (databaseError != null) {
                future.completeExceptionally(databaseError.toException());
            } else {
                future.complete(null);
            }
        });
        future.get();
    }
    
    // ... rest of the existing methods ...
}
