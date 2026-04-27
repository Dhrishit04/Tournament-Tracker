
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Download, Settings, Trash2, RotateCcw, Upload, FileUp, Loader2, Power, ImagePlus, X, Activity } from 'lucide-react';
import { useSeason } from '@/contexts/season-context';
import { uploadManagementImage, deleteManagementImage } from '@/firebase/storage';
import Image from 'next/image';
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
import { useState, useRef, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { AccessDenied } from '@/components/admin/access-denied';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';


export default function AdminSettingsPage() {
    const { isSystemAdmin, user } = useAuth();
    const { seasons, currentSeason, setCurrentSeason, createNextSeason, loading, deleteCurrentSeason, isSessionActive, setSessionActive } = useSeason();
    const { resetSeasonStats, wipeSeasonData, importSeasonPreset, bulkImportData } = useData();
    const { toast } = useToast();

    const [isPartialResetDialogOpen, setIsPartialResetDialogOpen] = useState(false);
    const [isFullResetDialogOpen, setIsFullResetDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [isBulkImportDialogOpen, setIsBulkImportDialogOpen] = useState(false);
    const [sourceSeasonToImport, setSourceSeasonToImport] = useState('');
    const [importing, setImporting] = useState(false);

    // Footfall Analytics State
    const [footfallDocs, setFootfallDocs] = useState<any[]>([]);
    const [footfallAllTime, setFootfallAllTime] = useState<number>(0);
    const [footfallPeriod, setFootfallPeriod] = useState<string>('all_time');
    const firestore = useFirestore();

    useEffect(() => {
        if (!firestore) return;
        
        const allTimeRef = doc(firestore, 'analytics', 'footfall_all_time');
        const unsubAllTime = onSnapshot(allTimeRef, (docSnap) => {
            if (docSnap.exists()) {
                setFootfallAllTime(docSnap.data().count || 0);
            }
        });

        const dailyQuery = query(collection(firestore, 'analytics'), where('date', '>=', '2000-01-01'));
        const unsubDaily = onSnapshot(dailyQuery, (snapshot) => {
            const docsData = snapshot.docs.map(d => d.data());
            setFootfallDocs(docsData.filter(d => d.date)); 
        });

        return () => {
            unsubAllTime();
            unsubDaily();
        };
    }, [firestore]);

    const displayedFootfall = useMemo(() => {
        if (footfallPeriod === 'all_time') return footfallAllTime;
        
        const daysToSubtract = parseInt(footfallPeriod);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToSubtract);
        const cutoffStr = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, '0')}-${String(cutoffDate.getDate()).padStart(2, '0')}`;
        
        return footfallDocs.filter(d => d.date >= cutoffStr).reduce((sum, d) => sum + (d.count || 0), 0);
    }, [footfallDocs, footfallAllTime, footfallPeriod]);

    // Management Slideshow State
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const canAccessSettings = isSystemAdmin || user?.canAccessSettings;

    if (!canAccessSettings) {
        return <AccessDenied />;
    }

    if (loading || !currentSeason) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-64 opacity-20" />
                <Card className="glass-card border-border/50"><CardContent className="h-64 opacity-5" /></Card>
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

    const { managementImages, updateManagementImages } = useSeason();

    const handleManagementImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !managementImages) return;

        if (managementImages.length >= 5) {
            toast({ variant: 'destructive', title: 'Limit Reached', description: 'You can only upload up to 5 images for the slideshow.' });
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast({ variant: 'destructive', title: 'File Too Large', description: 'Images must be under 10MB.' });
            return; // Under 10MB
        }

        setIsUploadingImage(true);
        try {
            const url = await uploadManagementImage(file);
            const newImages = [...managementImages, url];
            await updateManagementImages(newImages);
        } catch (error) {
            console.error("Firebase Storage Upload Error:", error);
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'Failed to upload image to Firebase storage. Check console for details.' });
        } finally {
            setIsUploadingImage(false);
            if (imageInputRef.current) imageInputRef.current.value = '';
        }
    };

    const handleRemoveManagementImage = async (urlToRemove: string) => {
        if (!managementImages) return;
        const newImages = managementImages.filter(url => url !== urlToRemove);
        await updateManagementImages(newImages);
        await deleteManagementImage(urlToRemove);
    };

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-black font-headline tracking-tighter italic uppercase text-foreground">System <span className="text-accent">Configuration</span></h1>
                <p className="text-muted-foreground font-medium">Control seasonal scoping and data lifecycle management.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <Card className="glass-card border-border/50 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <CardHeader className="bg-secondary/5 border-b border-border/50 relative z-10 flex flex-row items-center justify-between pb-4">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold flex items-center gap-3">
                                    <Activity className="h-5 w-5 text-accent" /> Public Footfall
                                </CardTitle>
                                <CardDescription className="text-xs hidden sm:block">
                                    Live analytics of unique visitors.
                                </CardDescription>
                            </div>
                            <Select value={footfallPeriod} onValueChange={setFootfallPeriod}>
                                <SelectTrigger className="w-[130px] h-9 text-[10px] font-black uppercase tracking-widest glass-card bg-white/5 border-white/10 shrink-0">
                                    <SelectValue placeholder="Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">Last 7 Days</SelectItem>
                                    <SelectItem value="15">Last 15 Days</SelectItem>
                                    <SelectItem value="30">Last 30 Days</SelectItem>
                                    <SelectItem value="60">Last 60 Days</SelectItem>
                                    <SelectItem value="all_time">All Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent className="pt-8 pb-8 relative z-10">
                            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/5 shadow-inner transition-all duration-500 ease-in-out">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl md:text-6xl font-black font-mono tracking-tighter text-foreground drop-shadow-lg">{displayedFootfall.toLocaleString()}</span>
                                    <span className="text-accent font-black uppercase tracking-widest text-[10px] md:text-xs">Visits</span>
                                </div>
                                <div className="mt-6 flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-green-500">Live Tracker Active</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>



                    <Card className="glass-card border-border/50 overflow-hidden">
                        <CardHeader className="bg-secondary/5 border-b border-border/50">
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

                    <Card className="glass-card border-border/50 overflow-hidden">
                        <CardHeader className="bg-secondary/5 border-b border-border/50">
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
                                    <Button className="w-full h-12 bg-secondary/10 hover:bg-secondary/20 text-foreground border border-border/50 shadow-lg font-black italic uppercase tracking-tighter">
                                        <Upload className="mr-2 h-4 w-4" /> Bulk Data Upload (.xlsx)
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card/40 backdrop-blur-2xl border border-border/50 shadow-2xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Initiate <span className="text-accent">Bulk Ingestion?</span></AlertDialogTitle>
                                        <AlertDialogDescription className="text-muted-foreground">
                                            This will <strong>overwrite</strong> the current registries for teams, players, and matches in {currentSeason?.name}. Ensure your Excel file contains all 4 required sheets with exact column mapping.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="py-6 flex flex-col items-center gap-4 bg-secondary/5 rounded-2xl border border-border/50">
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
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Target: {currentSeason?.name}</p>
                                    </div>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="glass-card border-border/50">Abort</AlertDialogCancel>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-border/50 overflow-hidden">
                        <CardHeader className="bg-secondary/5 border-b border-border/50">
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
                                <AlertDialogContent className="bg-card/40 backdrop-blur-2xl border border-border/50 shadow-2xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Initiate <span className="text-accent">Migration?</span></AlertDialogTitle>
                                        <AlertDialogDescription className="text-muted-foreground">
                                            This will overwrite current club and athlete registries in <strong>{currentSeason?.name}</strong>. This process is irreversible.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setSourceSeasonToImport('')} className="glass-card border-border/50">Abort</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleImportConfirm} className="bg-accent hover:bg-accent/90">Confirm Migration</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>


                </div>

                <div className="space-y-8">
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
                                <p className="font-bold text-sm tracking-tight text-foreground">Partial Protocol (Stat Reset)</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">Clears athlete/club performance logs but preserves registry.</p>
                            </div>
                            <AlertDialog open={isPartialResetDialogOpen} onOpenChange={setIsPartialResetDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="border-orange-500/50 text-orange-500 hover:bg-orange-500 hover:text-white transition-all h-10 w-fit px-6 rounded-full font-bold">
                                        <RotateCcw className="mr-2 h-4 w-4" /> Reset Stats
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card/40 backdrop-blur-2xl border border-border/50 shadow-2xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Stat <span className="text-orange-500">Purge</span></AlertDialogTitle>
                                        <AlertDialogDescription className="text-muted-foreground">
                                            This will zero out all performance metrics for <strong>{currentSeason?.name}</strong>. All match records will be cleared.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="glass-card border-border/50">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handlePartialReset} className="bg-orange-600 hover:bg-orange-700">Confirm Purge</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                        <Separator className="bg-destructive/10" />

                        <div className="flex flex-col gap-4">
                            <div>
                                <p className="font-bold text-sm tracking-tight text-foreground">Full Protocol (Data Wipe)</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">Permanently deletes all clubs, athletes, and fixtures from this season.</p>
                            </div>
                            <AlertDialog open={isFullResetDialogOpen} onOpenChange={setIsFullResetDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="bg-destructive hover:bg-destructive/90 h-10 w-fit px-6 rounded-full font-bold">
                                        <Trash2 className="mr-2 h-4 w-4" /> Wipe Entire Season
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card/40 backdrop-blur-2xl border border-border/50 shadow-2xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Data <span className="text-destructive">Annihilation</span></AlertDialogTitle>
                                        <AlertDialogDescription className="text-muted-foreground">
                                            This will permanently erase every club, athlete, and match associated with <strong>{currentSeason?.name}</strong>.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="glass-card border-border/50">Cancel</AlertDialogCancel>
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
                                        <p className="font-bold text-sm tracking-tight text-foreground">Decommission Season</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">Removes the season entry itself from the global timeline.</p>
                                    </div>
                                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" disabled={seasons.length <= 1} className="text-destructive hover:bg-destructive/20 hover:text-destructive h-10 w-fit px-6 rounded-full font-bold">
                                                Terminate Season Timeline
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-card/40 backdrop-blur-2xl border border-border/50 shadow-2xl">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Season <span className="text-destructive">Termination</span></AlertDialogTitle>
                                                <AlertDialogDescription className="text-muted-foreground">
                                                    This will permanently remove <strong>{currentSeason?.name}</strong> from the DFPL infrastructure. This cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="glass-card border-border/50">Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDeleteSeason} className="bg-destructive hover:bg-destructive/90">Confirm Termination</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="glass-card border-border/50 overflow-hidden">
                    <CardHeader className="bg-secondary/5 border-b border-border/50">
                        <CardTitle className="text-lg font-bold flex items-center gap-3">
                            <Power className="h-5 w-5 text-accent" /> System Status
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Toggle overall application visibility for non-administrative users.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="space-y-0.5">
                                <Label htmlFor="session-active-toggle" className="text-sm font-bold uppercase tracking-tight">Public Session</Label>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                    {isSessionActive ? "Site is visible to the public." : "Site is hidden (Maintenance Mode)."}
                                </p>
                            </div>
                            <Switch
                                id="session-active-toggle"
                                checked={isSessionActive}
                                onCheckedChange={setSessionActive}
                                className="data-[state=checked]:bg-accent"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-border/50 overflow-hidden">
                    <CardHeader className="bg-secondary/5 border-b border-border/50">
                        <CardTitle className="text-lg font-bold flex items-center gap-3">
                            <ImagePlus className="h-5 w-5 text-accent" /> Management Slideshow
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Upload up to 5 high-resolution images (max 10MB each) for the DFPL Management section on the public homepage.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {managementImages?.map((url, index) => (
                                    <div key={index} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 group bg-card/50">
                                        <Image src={url} alt={`Management Image ${index + 1}`} fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                            <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => handleRemoveManagementImage(url)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {(!managementImages || managementImages.length < 5) && (
                                    <button
                                        onClick={() => imageInputRef.current?.click()}
                                        disabled={isUploadingImage}
                                        className="aspect-[4/3] rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {isUploadingImage ? (
                                            <Loader2 className="h-6 w-6 animate-spin text-accent" />
                                        ) : (
                                            <>
                                                <ImagePlus className="h-6 w-6 group-hover:scale-110 transition-transform group-hover:text-accent" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{managementImages?.length || 0}/5 Upload</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                className="hidden"
                                ref={imageInputRef}
                                onChange={handleManagementImageUpload}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
            </div>
        </div>
    );
}
