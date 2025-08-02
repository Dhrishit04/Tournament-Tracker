package com.dhrishit.tournamate.service;

import com.dhrishit.tournamate.model.Player;
import com.dhrishit.tournamate.model.Team;
import com.dhrishit.tournamate.model.TeamStats;
import com.google.firebase.FirebaseApp;
import com.google.firebase.database.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
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

    public List<Team> getAllTeams() throws ExecutionException, InterruptedException {
        CompletableFuture<List<Team>> future = new CompletableFuture<>();
        databaseReference.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                List<Team> teams = new ArrayList<>();
                if (dataSnapshot.exists()) {
                    for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                        Team team = snapshot.getValue(Team.class);
                        teams.add(team);
                    }
                }
                future.complete(teams);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                future.completeExceptionally(databaseError.toException());
            }
        });
        return future.get();
    }

    public Optional<Team> getTeamById(String id) throws ExecutionException, InterruptedException {
        CompletableFuture<Optional<Team>> future = new CompletableFuture<>();
        databaseReference.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                if (dataSnapshot.exists()) {
                    future.complete(Optional.ofNullable(dataSnapshot.getValue(Team.class)));
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

    public Team addTeam(Team team) throws ExecutionException, InterruptedException {
        String newTeamId = databaseReference.push().getKey();
        if (newTeamId == null) {
            throw new IllegalStateException("Could not generate a new team ID.");
        }
        team.setId(newTeamId);
        
        TeamStats initialStats = new TeamStats(0, 0, 0, 0, 0, 0, 0, 0, 0);
        team.setStats(initialStats);
        team.setPlayers(Collections.emptyList());

        CompletableFuture<Void> future = new CompletableFuture<>();
        databaseReference.child(newTeamId).setValue(team, (databaseError, databaseReference) -> {
            if (databaseError != null) {
                future.completeExceptionally(databaseError.toException());
            } else {
                future.complete(null);
            }
        });
        future.get();
        return team;
    }

    public Optional<Team> updateTeam(String id, Team updatedTeam) throws ExecutionException, InterruptedException {
        Optional<Team> existingTeamOptional = getTeamById(id);
        
        if (existingTeamOptional.isPresent()) {
            updatedTeam.setId(id);
            CompletableFuture<Void> future = new CompletableFuture<>();
            databaseReference.child(id).setValue(updatedTeam, (databaseError, databaseReference) -> {
                if (databaseError != null) {
                    future.completeExceptionally(databaseError.toException());
                } else {
                    future.complete(null);
                }
            });
            future.get();
            return Optional.of(updatedTeam);
        } else {
            return Optional.empty();
        }\
    }

    public boolean deleteTeam(String id) throws ExecutionException, InterruptedException {
        Optional<Team> existingTeamOptional = getTeamById(id);

        if (existingTeamOptional.isPresent()) {
            CompletableFuture<Void> future = new CompletableFuture<>();
            databaseReference.child(id).removeValue((databaseError, databaseReference) -> {
                if (databaseError != null) {
                    future.completeExceptionally(databaseError.toException());
                } else {
                    future.complete(null);
                }
            });
            future.get();
            return true;
        } else {
            return false;
        }
    }

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
}