package com.dhrishit.tournamate.service;

import com.dhrishit.tournamate.model.Player;
import com.dhrishit.tournamate.model.Team;
import com.dhrishit.tournamate.model.TeamStats;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TeamService {

    private final ConcurrentHashMap<String, Team> teams = new ConcurrentHashMap<>();

    public TeamService() {
        // Initialize with some mock data
        Player player1 = new Player("p1", "Player One", "Team Alpha", "Forward", "100000", Arrays.asList("ST", "LW"), "Right", 25, Arrays.asList("Fast", "Good Finisher"), 10, 5, 20, 15, 3, 2, 0);
        Player player2 = new Player("p2", "Player Two", "Team Alpha", "Midfielder", "80000", Arrays.asList("CM", "CDM"), "Left", 28, Arrays.asList("Good Passer"), 3, 12, 18, 12, 4, 1, 0);
        Player player3 = new Player("p3", "Player Three", "Team Beta", "Defender", "70000", Arrays.asList("CB", "LB"), "Right", 22, Arrays.asList("Strong Tackler"), 1, 2, 22, 10, 8, 3, 1);

        TeamStats stats1 = new TeamStats(50, 30, 25, 18, 5, 2, 10, 15, 1);
        TeamStats stats2 = new TeamStats(45, 28, 26, 15, 7, 4, 8, 12, 0);

        Team team1 = new Team(UUID.randomUUID().toString(), "Team Alpha", "Owner A", "/images/teams/dsk.png", Arrays.asList(player1, player2), stats1);
        Team team2 = new Team(UUID.randomUUID().toString(), "Team Beta", "Owner B", "/images/teams/sh.png", Arrays.asList(player3), stats2);

        teams.put(team1.getId(), team1);
        teams.put(team2.getId(), team2);
    }

    public List<Team> getAllTeams() {
        return new ArrayList<>(teams.values());
    }

    public Optional<Team> getTeamById(String id) {
        return Optional.ofNullable(teams.get(id));
    }

    public Team addTeam(Team team) {
        if (team.getId() == null || team.getId().isEmpty()) {
            team.setId(UUID.randomUUID().toString());
        }
        teams.put(team.getId(), team);
        return team;
    }

    public Optional<Team> updateTeam(String id, Team updatedTeam) {
        if (teams.containsKey(id)) {
            updatedTeam.setId(id); // Ensure the ID remains the same
            teams.put(id, updatedTeam);
            return Optional.of(updatedTeam);
        }
        return Optional.empty();
    }

    public boolean deleteTeam(String id) {
        return teams.remove(id) != null;
    }
}
