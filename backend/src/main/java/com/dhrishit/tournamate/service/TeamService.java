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

    // ... existing getAllTeams and getTeamById methods ...

    public Team addTeam(Team team) throws ExecutionException, InterruptedException {
        String newTeamId = databaseReference.push().getKey();
        if (newTeamId == null) {
            throw new IllegalStateException("Could not generate a new team ID.");
        }
        team.setId(newTeamId);

        // Initialize empty stats and players list for a new team
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

    // ... existing updateTeam, deleteTeam, addPlayerToTeam, removePlayerFromTeam methods ...
}
