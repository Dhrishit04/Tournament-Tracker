'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Download, Settings, Trash2, RotateCcw, Upload, FileUp, Loader2 } from 'lucide-react';
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
import { useState, useRef } from 'react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { AccessDenied } from '@/components/admin/access-denied';
import { useToast } from '@/hooks/use-toast';


export default function AdminSettingsPage() {
    const { isSystemAdmin, user } = useAuth();
    const { seasons, currentSeason, setCurrentSeason, createNextSeason, loading, deleteCurrentSeason } = useSeason();
    const { resetSeasonStats, wipeSeasonData, importSeasonPreset, bulkImportData } = useData();
    const { toast } = useToast();
    
    const [isPartialResetDialogOpen, setIsPartialResetDialogOpen] = useState(false);
    const [isFullResetDialogOpen, setIsFullResetDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [isBulkImportDialogOpen, setIsBulkImportDialogOpen] = useState(false);
    const [sourceSeasonToImport, setSourceSeasonToImport] = useState('');
    const [importing, setImporting] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canAccessSettings = isSystemAdmin || user?.canAccessSettings;

    if (!canAccessSettings) {
        return <AccessDenied />;
    }

    if (loading || !currentSeason) {
      return (
        <div className="space-y-8">
            <Skeleton className="h-10 w-64 opacity-20" />
            <Card className="glass-card border-white/5"><CardContent className="h-64 opacity-5"/></Card>
        </div>
      )
    }

    const handlePartialReset = async () => {
        if (!currentSeason) return;
        await resetSeasonStats();
        setIsPartialResetDialogOpen(false);
    }

    const handleFullReset = async () => {
        if (!currentSeason) return;
        await wipeSeasonData();
        setIsFullResetDialogOpen(false);
    }
    
    const handleImportConfirm = async () => {
        if (!sourceSeasonToImport) return;
        await importSeasonPreset(sourceSeasonToImport);
        setIsImportDialogOpen(false);
        setSourceSeasonToImport('');
    };

    const handleBulkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.xlsx')) {
            toast({ variant: 'destructive', title: 'File Refused', description: 'Only .xlsx Excel files are supported for bulk ingestion.' });
            return;
        }

        setImporting(true);
        try {
            await bulkImportData(file);
            setIsBulkImportDialogOpen(false);
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteSeason = async () => {
        await wipeSeasonData();
        await deleteCurrentSeason();
        setIsDeleteDialogOpen(false);
    }

    const handleSeasonChange = async (value: string) => {
        if (value === 'next-season') {
            await createNextSeason();
        } else {
            await setCurrentSeason(value);
        }
    }

    return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black font-headline tracking-tighter italic uppercase">System <span className="text-accent">Configuration</span></h1>
        <p className="text-muted-foreground font-medium">Control seasonal scoping and data lifecycle management.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card className="glass-card border-white/5 overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/5">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <Settings className="h-5 w-5 text-accent" /> Active Season
              </CardTitle>
              <CardDescription className="text-xs">
                Switch between historical data sets or initialize a new competitive season.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
                <div className="w-full">
                    <Select value={currentSeason.id} onValueChange={handleSeasonChange}>
                        <SelectTrigger className="glass-card h-12">
                            <SelectValue placeholder="Select active season" />
                        </SelectTrigger>
                        <SelectContent>
                            {seasons.map(season => (
                                <SelectItem key={season.id} value={season.id}>{season.name} ({season.year})</SelectItem>
                            ))}
                            {canAccessSettings && (
                                <SelectItem value="next-season" className="text-accent font-black italic">Deploy Next Season</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/5">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <FileUp className="h-5 w-5 text-accent" /> Bulk Ingestion
              </CardTitle>
              <CardDescription className="text-xs">
                Populate {currentSeason?.name} registry and stats via professional Excel data.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
                <AlertDialog open={isBulkImportDialogOpen} onOpenChange={setIsBulkImportDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <Button className="w-full h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-lg font-black italic uppercase tracking-tighter">
                            <Upload className="mr-2 h-4 w-4" /> Bulk Data Upload (.xlsx)
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-card border-white/5">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Initiate <span className="text-accent">Bulk Ingestion?</span></AlertDialogTitle>
                            <AlertDialogDescription className="text-white/70">
                                This will <strong>overwrite</strong> the current registries for teams, players, and matches in {currentSeason?.name}. Ensure your Excel file contains all 4 required sheets with exact column mapping.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-6 flex flex-col items-center gap-4 bg-white/5 rounded-2xl border border-white/5">
                            <input 
                                type="file" 
                                accept=".xlsx" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleBulkFileChange}
                            />
                            <Button 
                                onClick={() => fileInputRef.current?.click()} 
                                disabled={importing}
                                className="bg-accent hover:bg-accent/90 h-14 px-8 rounded-full shadow-2xl shadow-accent/20"
                            >
                                {importing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Select Excel File"}
                            </Button>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Target: {currentSeason?.name}</p>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="glass-card border-white/10">Abort</AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/5">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <Download className="h-5 w-5 text-accent" /> Data Migration
              </CardTitle>
              <CardDescription className="text-xs">
                Synchronize rosters from previous operations into {currentSeason?.name}.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-4">
                <Select onValueChange={setSourceSeasonToImport} value={sourceSeasonToImport}>
                    <SelectTrigger className="glass-card h-12">
                        <SelectValue placeholder="Source season" />
                    </SelectTrigger>
                    <SelectContent>
                    {seasons.filter(s => s.id !== currentSeason?.id).map(season => (
                        <SelectItem key={season.id} value={season.id}>{season.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <AlertDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                    <AlertDialogTrigger asChild>
                    <Button disabled={!sourceSeasonToImport} className="w-full h-12 bg-accent hover:bg-accent/90 shadow-lg">Execute Import</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-card border-white/5">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Initiate <span className="text-accent">Migration?</span></AlertDialogTitle>
                        <AlertDialogDescription className="text-white/70">
                            This will overwrite current club and athlete registries in <strong>{currentSeason?.name}</strong>. This process is irreversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSourceSeasonToImport('')} className="glass-card border-white/10">Abort</AlertDialogCancel>
                        <AlertDialogAction onClick={handleImportConfirm} className="bg-accent hover:bg-accent/90">Confirm Migration</AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card border-destructive/20 bg-destructive/5 overflow-hidden h-fit">
          <CardHeader className="bg-destructive/10 border-b border-destructive/10">
              <CardTitle className="flex items-center gap-3 text-destructive uppercase tracking-tighter font-black italic">
                  <AlertTriangle className="h-5 w-5" /> Critical Zones
              </CardTitle>
              <CardDescription className="text-destructive/70 text-xs">
                  High-impact operations. Proceed with extreme caution.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
              <div className="flex flex-col gap-4">
                  <div>
                      <p className="font-bold text-sm tracking-tight">Partial Protocol (Stat Reset)</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">Clears athlete/club performance logs but preserves registry.</p>
                  </div>
                  <AlertDialog open={isPartialResetDialogOpen} onOpenChange={setIsPartialResetDialogOpen}>
                      <AlertDialogTrigger asChild>
                          <Button variant="outline" className="border-orange-500/50 text-orange-500 hover:bg-orange-500 hover:text-white transition-all h-10 w-fit px-6 rounded-full font-bold">
                            <RotateCcw className="mr-2 h-4 w-4" /> Reset Stats
                          </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card border-white/5">
                          <AlertDialogHeader>
                              <AlertDialogTitle className="text-2xl font-black italic tracking-tighter uppercase">Stat <span className="text-orange-500">Purge</span></AlertDialogTitle>
                              <AlertDialogDescription className="text-white/70">
                                This will zero out all performance metrics for <strong>{currentSeason?.name}</strong>. All match records will be cleared.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel className="glass-card border-white/10">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handlePartialReset} className="bg-orange-600 hover:bg-orange-700">Confirm Purge</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
              </div>

              <Separator className="bg-destructive/10" />

               <div className="flex flex-col gap-4">
                  <div>
                      <p className="font-bold text-sm tracking-tight">Full Protocol (Data Wipe)</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">Permanently deletes all clubs, athletes, and fixtures from this season.</p>
                  </div>
                  <AlertDialog open={isFullResetDialogOpen} onOpenChange={setIsFullResetDialogOpen}>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="bg-destructive hover:bg-destructive/90 h-10 w-fit px-6 rounded-full font-bold">
                            <Trash2 className="mr-2 h-4 w-4" /> Wipe Entire Season
                          </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card border-white/5">
                          <AlertDialogHeader>
                              <AlertDialogTitle className="text-2xl font-black italic tracking-tighter uppercase">Data <span className="text-destructive">Annihilation</span></AlertDialogTitle>
                              <AlertDialogDescription className="text-white/70">
                                This will permanently erase every club, athlete, and match associated with <strong>{currentSeason?.name}</strong>.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel className="glass-card border-white/10">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleFullReset} className="bg-destructive hover:bg-destructive/90">Confirm Annihilation</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
              </div>

              {canAccessSettings && (
                <>
                    <Separator className="bg-destructive/10" />
                    <div className="flex flex-col gap-4">
                        <div>
                            <p className="font-bold text-sm tracking-tight">Decommission Season</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">Removes the season entry itself from the global timeline.</p>
                        </div>
                        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" disabled={seasons.length <= 1} className="text-destructive hover:bg-destructive/20 hover:text-destructive h-10 w-fit px-6 rounded-full font-bold">
                                    Terminate Season Timeline
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass-card border-white/5">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-2xl font-black italic tracking-tighter uppercase">Season <span className="text-destructive">Termination</span></AlertDialogTitle>
                                    <AlertDialogDescription className="text-white/70">
                                        This will permanently remove <strong>{currentSeason?.name}</strong> from the DFPL infrastructure. This cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="glass-card border-white/5">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteSeason} className="bg-destructive hover:bg-destructive/90">Confirm Termination</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
