// src/lib/api.ts

import { Player, Team } from "@/types";

const API_BASE_URL = "http://localhost:8080/api";

// --- Team Functions ---

export async function fetchTeams(): Promise<Team[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/teams`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
}

export async function fetchTeamById(id: string): Promise<Team | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/teams/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error(`Error fetching team with id ${id}:`, error);
    return null;
  }
}

export async function addTeam(team: Omit<Team, 'id' | 'stats' | 'players'>): Promise<Team | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error("Error adding team:", error);
    return null;
  }
}

export async function updateTeam(teamId: string, team: Partial<Team>): Promise<Team | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error("Error updating team:", error);
    return null;
  }
}

export async function deleteTeam(teamId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting team:", error);
    return false;
  }
}

// --- Player Functions ---

export async function fetchPlayers(): Promise<Player[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/players`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error("Error fetching players:", error);
    return [];
  }
}

export async function addPlayer(player: Omit<Player, 'id'>): Promise<Player | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error("Error adding player:", error);
    return null;
  }
}

export async function updatePlayer(playerId: string, player: Partial<Player>): Promise<Player | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/players/${playerId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(player),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error("Error updating player:", error);
        return null;
    }
}

export async function deletePlayer(playerId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/players/${playerId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting player:", error);
    return false;
  }
}
