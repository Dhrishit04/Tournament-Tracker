package com.dhrishit.tournamate.model;

import java.util.List;

// Matches the Team interface in src/types/index.ts
public class Team {
    private String id;
    private String name;
    private String owner;
    private String logoUrl;
    private List<Player> players; // Roster of players
    private TeamStats stats; // Aggregated team statistics

    // Constructors
    public Team() {
    }

    public Team(String id, String name, String owner, String logoUrl, List<Player> players, TeamStats stats) {
        this.id = id;
        this.name = name;
        this.owner = owner;
        this.logoUrl = logoUrl;
        this.players = players;
        this.stats = stats;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public List<Player> getPlayers() {
        return players;
    }

    public void setPlayers(List<Player> players) {
        this.players = players;
    }

    public TeamStats getStats() {
        return stats;
    }

    public void setStats(TeamStats stats) {
        this.stats = stats;
    }
}
