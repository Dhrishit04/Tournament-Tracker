package com.dhrishit.tournamate.service;

import com.dhrishit.tournamate.model.Team;
import com.google.firebase.database.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Service
public class TeamService {

    private final DatabaseReference databaseReference;

    public TeamService() {
        this.databaseReference = FirebaseDatabase.getInstance().getReference("teams");
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
        CompletableFuture<Optional<Team>> resultFuture = new CompletableFuture<>();

        getTeamById(id).thenCompose(existingTeamOptional -> {
            if (existingTeamOptional.isPresent()) {
                updatedTeam.setId(id);
                CompletableFuture<Void> setValueFuture = new CompletableFuture<>();
                databaseReference.child(id).setValue(updatedTeam, (databaseError, databaseReference) -> {
                    if (databaseError != null) {
                        setValueFuture.completeExceptionally(databaseError.toException());
                    } else {
                        setValueFuture.complete(null);
                    }
                });
                return setValueFuture.thenApply(v -> Optional.of(updatedTeam));
            } else {
                return CompletableFuture.completedFuture(Optional.empty());
            }
        }).exceptionally(ex -> {
            resultFuture.completeExceptionally(ex);
            return null;
        });

        return resultFuture.get();
    }

    public boolean deleteTeam(String id) throws ExecutionException, InterruptedException {
        CompletableFuture<Boolean> resultFuture = new CompletableFuture<>();

        getTeamById(id).thenCompose(existingTeamOptional -> {
            if (existingTeamOptional.isPresent()) {
                CompletableFuture<Void> removeValueFuture = new CompletableFuture<>();
                databaseReference.child(id).removeValue((databaseError, databaseReference) -> {
                    if (databaseError != null) {
                        removeValueFuture.completeExceptionally(databaseError.toException());
                    } else {
                        removeValueFuture.complete(null);
                    }
                });
                return removeValueFuture.thenApply(v -> true);
            } else {
                return CompletableFuture.completedFuture(false);
            }
        }).exceptionally(ex -> {
            resultFuture.completeExceptionally(ex);
            return null;
        });
        return resultFuture.get();
    }
}
