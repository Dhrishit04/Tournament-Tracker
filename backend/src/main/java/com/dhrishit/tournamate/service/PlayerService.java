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

    public List<Player> getAllPlayers() throws ExecutionException, InterruptedException {
        CompletableFuture<List<Player>> future = new CompletableFuture<>();
        databaseReference.addListenerForSingleValueEvent(new ValueEventListener() {
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
        databaseReference.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
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
        
        teamService.addPlayerToTeam(player.getTeam(), player);

        return player;
    }

    public Optional<Player> updatePlayer(String id, Player updatedPlayer) throws ExecutionException, InterruptedException {
        Optional<Player> existingPlayerOptional = getPlayerById(id);
        
        if (existingPlayerOptional.isPresent()) {
            Player existingPlayer = existingPlayerOptional.get();
            updatedPlayer.setId(id);
            CompletableFuture<Void> future = new CompletableFuture<>();
            databaseReference.child(id).setValue(updatedPlayer, (databaseError, databaseReference) -> {
                if (databaseError != null) {
                    future.completeExceptionally(databaseError.toException());
                } else {
                    future.complete(null);
                }
            });
            future.get();

            if (!existingPlayer.getTeam().equals(updatedPlayer.getTeam())) {
                teamService.removePlayerFromTeam(existingPlayer.getTeam(), id);
                teamService.addPlayerToTeam(updatedPlayer.getTeam(), updatedPlayer);
            }

            return Optional.of(updatedPlayer);
        } else {
            return Optional.empty();
        }
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

            teamService.removePlayerFromTeam(player.getTeam(), id);

            return true;
        } else {
            return false;
        }
    }
}
