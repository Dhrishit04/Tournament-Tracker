'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Save } from 'lucide-react';
import { useSeason } from '@/contexts/season-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useData } from '@/hooks/use-data';
import { useState } from 'react';


export default function AdminSettingsPage() {
    const { seasons, currentSeason, setCurrentSeason, createNextSeason, loading } = useSeason();
    const { resetSeason } = useData();
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

    const handleResetSeason = async () => {
        if (!currentSeason) return;
        await resetSeason();
        setIsResetDialogOpen(false);
    }
    
    if (loading || !currentSeason) {
      return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        </div>
      )
    }

    const handleSeasonChange = async (value: string) => {
        if (value === 'next-season') {
            await createNextSeason();
        } else {
            await setCurrentSeason(value);
        }
    }

    return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">Tournament Settings</h1>
        <Button disabled>
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Season Management</CardTitle>
          <CardDescription>
            Select the active season for the app. All data for teams, players, and matches will be scoped to the selected season.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="w-full max-w-sm">
                <Select value={currentSeason.id} onValueChange={handleSeasonChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a season" />
                    </SelectTrigger>
                    <SelectContent>
                        {seasons.map(season => (
                            <SelectItem key={season.id} value={season.id}>{season.name}</SelectItem>
                        ))}
                        <SelectItem value="next-season" className="text-primary font-bold">Create Next Season</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>
      <Card className="mt-8 border-destructive">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle /> Danger Zone
            </CardTitle>
            <CardDescription>
                These actions are irreversible. Please proceed with caution.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold">Reset Current Season</p>
                    <p className="text-sm text-muted-foreground">
                        This will reset all player, team, and match statistics for the current season to zero.
                    </p>
                </div>
                <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">Reset Season</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently reset all statistics for{' '}
                                <strong>{currentSeason?.name}</strong>. All match results will be cleared, and player/team stats will be set to zero.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetSeason} className="bg-destructive hover:bg-destructive/90">
                                Yes, reset season
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </CardContent>
    </Card>
    </div>
  );
}
