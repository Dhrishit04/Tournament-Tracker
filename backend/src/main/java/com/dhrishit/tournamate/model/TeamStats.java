package com.dhrishit.tournamate.model;

// Matches the TeamStats interface in src/types/index.ts
public class TeamStats {
    private Integer totalGoals;
    private Integer totalAssists;
    private Integer matchesPlayed;
    private Integer matchesWon;
    private Integer matchesLost;
    private Integer matchesDrawn;
    private Integer cleanSheets;
    private Integer totalYellowCards;
    private Integer totalRedCards;

    // Constructors
    public TeamStats() {
    }

    public TeamStats(Integer totalGoals, Integer totalAssists, Integer matchesPlayed, Integer matchesWon, Integer matchesLost, Integer matchesDrawn, Integer cleanSheets, Integer totalYellowCards, Integer totalRedCards) {
        this.totalGoals = totalGoals;
        this.totalAssists = totalAssists;
        this.matchesPlayed = matchesPlayed;
        this.matchesWon = matchesWon;
        this.matchesLost = matchesLost;
        this.matchesDrawn = matchesDrawn;
        this.cleanSheets = cleanSheets;
        this.totalYellowCards = totalYellowCards;
        this.totalRedCards = totalRedCards;
    }

    // Getters and Setters
    public Integer getTotalGoals() {
        return totalGoals;
    }

    public void setTotalGoals(Integer totalGoals) {
        this.totalGoals = totalGoals;
    }

    public Integer getTotalAssists() {
        return totalAssists;
    }

    public void setTotalAssists(Integer totalAssists) {
        this.totalAssists = totalAssists;
    }

    public Integer getMatchesPlayed() {
        return matchesPlayed;
    }

    public void setMatchesPlayed(Integer matchesPlayed) {
        this.matchesPlayed = matchesPlayed;
    }

    public Integer getMatchesWon() {
        return matchesWon;
    }

    public void setMatchesWon(Integer matchesWon) {
        this.matchesWon = matchesWon;
    }

    public Integer getMatchesLost() {
        return matchesLost;
    }

    public void setMatchesLost(Integer matchesLost) {
        this.matchesLost = matchesLost;
    }

    public Integer getMatchesDrawn() {
        return matchesDrawn;
    }

    public void setMatchesDrawn(Integer matchesDrawn) {
        this.matchesDrawn = matchesDrawn;
    }

    public Integer getCleanSheets() {
        return cleanSheets;
    }

    public void setCleanSheets(Integer cleanSheets) {
        this.cleanSheets = cleanSheets;
    }

    public Integer getTotalYellowCards() {
        return totalYellowCards;
    }

    public void setTotalYellowCards(Integer totalYellowCards) {
        this.totalYellowCards = totalYellowCards;
    }

    public Integer getTotalRedCards() {
        return totalRedCards;
    }

    public void setTotalRedCards(Integer totalRedCards) {
        this.totalRedCards = totalRedCards;
    }
}
