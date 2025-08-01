// src/hooks/use-api.ts
import useSWR from 'swr';
import { fetchTeams, fetchTeamById, fetchPlayers } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useTeams() {
  const { data, error, isLoading, mutate } = useSWR('api/teams', fetchTeams);
  return {
    teams: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTeam(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(id ? `api/teams/${id}` : null, () => fetchTeamById(id!));
  return {
    team: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function usePlayers() {
  const { data, error, isLoading, mutate } = useSWR('api/players', fetchPlayers);
  return {
    players: data,
    isLoading,
    isError: error,
    mutate,
  };
}
