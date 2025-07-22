package com.dhrishit.tournamate.model;

import java.util.List;

// Matches the Player interface in src/types/index.ts as closely as possible
public class Player {
    private String id;
    private String name;
    private String team;
    private String category;
    private String basePrice;
    private List<String> preferredPosition;
    private String preferredFoot;
    private Integer age;
    private List<String> remarks;
    private Integer goals;
    private Integer assists;
    private Integer matchesPlayed;
    private Integer matchesWon;
    private Integer matchesLost;
    private Integer yellowCards;
    private Integer redCards;

    // Constructors
    public Player() {
    }

    public Player(String id, String name, String team, String category, String basePrice, List<String> preferredPosition, String preferredFoot, Integer age, List<String> remarks, Integer goals, Integer assists, Integer matchesPlayed, Integer matchesWon, Integer matchesLost, Integer yellowCards, Integer redCards) {
        this.id = id;
        this.name = name;
        this.team = team;
        this.category = category;
        this.basePrice = basePrice;
        this.preferredPosition = preferredPosition;
        this.preferredFoot = preferredFoot;
        this.age = age;
        this.remarks = remarks;
        this.goals = goals;
        this.assists = assists;
        this.matchesPlayed = matchesPlayed;
        this.matchesWon = matchesWon;
        this.matchesLost = matchesLost;
        this.yellowCards = yellowCards;
        this.redCards = redCards;
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

    public String getTeam() {
        return team;
    }

    public void setTeam(String team) {
        this.team = team;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(String basePrice) {
        this.basePrice = basePrice;
    }

    public List<String> getPreferredPosition() {
        return preferredPosition;
    }

    public void setPreferredPosition(List<String> preferredPosition) {
        this.preferredPosition = preferredPosition;
    }

    public String getPreferredFoot() {
        return preferredFoot;
    }

    public void setPreferredFoot(String preferredFoot) {
        this.preferredFoot = preferredFoot;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public List<String> getRemarks() {
        return remarks;
    }

    public void setRemarks(List<String> remarks) {
        this.remarks = remarks;
    }

    public Integer getGoals() {
        return goals;
    }

    public void setGoals(Integer goals) {
        this.goals = goals;
    }

    public Integer getAssists() {
        return assists;
    }

    public void setAssists(Integer assists) {
        this.assists = assists;
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

    public Integer getYellowCards() {
        return yellowCards;
    }

    public void setYellowCards(Integer yellowCards) {
        this.yellowCards = yellowCards;
    }

    public Integer getRedCards() {
        return redCards;
    }

    public void setRedCards(Integer redCards) {
        this.redCards = redCards;
    }
}
