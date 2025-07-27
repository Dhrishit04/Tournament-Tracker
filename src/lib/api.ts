// src/lib/api.ts

import { Player, Team } from "@/types";

const API_BASE_URL = "http://localhost:8080/api";

// --- Team Functions ---

export async function fetchTeams(): Promise<Team[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/teams`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
}

export async function addTeam(team: Omit<Team, 'id' | 'stats' | 'players'>): Promise<Team | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(team),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error adding team:", error);
    return null;
  }
}

export async function updateTeam(team: Team): Promise<Team | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/teams/${team.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(team),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
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
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error deleting team:", error);
    return false;
  }
}

// --- Player Functions ---

export async function fetchPlayers(): Promise<Player[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/players`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching players:", error);
    return [];
  }
}
