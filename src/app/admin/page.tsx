
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Calendar, Settings, ArrowUpRight, Radio, Sparkles, Send, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useData } from '@/hooks/use-data';
import { useSeason } from '@/contexts/season-context';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { analyzeSeason, type AnalyzeSeasonOutput } from '@/ai/flows/season-scout-flow';
import { useAuth } from '@/hooks/use-auth';

export default function AdminDashboardPage() {
  const { teams, players, matches, loading } = useData();
  const { globalAnnouncement, updateGlobalAnnouncement, currentSeason } = useSeason();
  const { isSystemAdmin, user } = useAuth();
  
  const [announcementText, setAnnouncementText] = useState('');
  const [isBroadcastActive, setIsBroadcastActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<AnalyzeSeasonOutput | null>(null);

  // Sync internal state with context when data loads
  useEffect(() => {
    if (globalAnnouncement) {
      setAnnouncementText(globalAnnouncement.message || '');
      setIsBroadcastActive(globalAnnouncement.isActive || false);
    }
  }, [globalAnnouncement]);

  const dashboardCards = useMemo(() => {
    const cards = [
        { title: 'Players', icon: <Users className="h-5 w-5"/>, href: '/admin/players', description: 'Roster & performance control' },
        { title: 'Teams', icon: <Shield className="h-5 w-5"/>, href: '/admin/teams', description: 'Team identities & global stats' },
        { title: 'Fixtures', icon: <Calendar className="h-5 w-5"/>, href: '/admin/matches', description: 'Schedule & live match engine' },
    ];

    if (isSystemAdmin || user?.canAccessSettings) {
        cards.push({ title: 'Settings', icon: <Settings className="h-5 w-5"/>, href: '/admin/settings', description: 'System-wide season settings' });
    }

    return cards;
  }, [isSystemAdmin, user?.canAccessSettings]);

  const stats = [
    { label: 'Total Teams', value: teams.length },
    { label: 'Total Players', value: players.length },
    { label: 'Fixtures Logged', value: matches.length },
  ];

  const handleSaveMessage = () => {
    updateGlobalAnnouncement({
        message: announcementText,
        isActive: isBroadcastActive
    });
  };

  const handleToggleBroadcast = (checked: boolean) => {
    setIsBroadcastActive(checked);
    updateGlobalAnnouncement({
        message: announcementText,
        isActive: checked
    });
  };

  const handleRunAiScout = async () => {
    if (!currentSeason) return;
    setIsAnalyzing(true);
    try {
        const result = await analyzeSeason({
            teams,
            players,
            seasonName: currentSeason.name
        });
        setAiReport(result);
    } catch (error) {
        console.error("AI Scout failed:", error);
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tighter italic mb-2 uppercase">Command <span className="text-accent">Center</span></h1>
          <p className="text-muted-foreground font-medium">Tournament intelligence and administrative gateway.</p>
        </div>
        <div className="flex items-center gap-2 bg-accent/5 border border-accent/20 px-4 py-2 rounded-full">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Session Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link href={card.href} className="group">
              <Card className="glass-card h-full transition-all duration-500 hover:border-accent/40 hover:-translate-y-1 overflow-hidden relative border-white/5">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-4 w-4 text-accent" />
                </div>
                <CardHeader className="pb-2">
                  <div className="p-3 bg-accent/10 rounded-xl w-fit mb-4 group-hover:bg-accent/20 transition-colors">
                    <div className="text-accent">{card.icon}</div>
                  </div>
                  <CardTitle className="text-lg font-bold tracking-tight">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card border-white/5 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Radio className="h-5 w-5 text-accent" /> Broadcast Hub
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="broadcast-toggle" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Public Ticker Status</Label>
                        <p className="text-[10px] text-muted-foreground/60 italic">Live updates appear on the homepage ecosystem.</p>
                    </div>
                    <Switch 
                        id="broadcast-toggle" 
                        checked={isBroadcastActive} 
                        onCheckedChange={handleToggleBroadcast} 
                    />
                </div>
                <div className="flex gap-3">
                    <Input 
                        placeholder="Type a flash announcement (e.g., Match delayed, Results updated...)" 
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        className="glass-card bg-background/50 h-12"
                    />
                    <Button onClick={handleSaveMessage} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 h-12">
                        <Save className="h-4 w-4 mr-2" /> Save
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" /> AI Season Scout
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full border-accent/20 text-accent hover:bg-accent/10"
                onClick={handleRunAiScout}
                disabled={isAnalyzing || loading}
              >
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {aiReport ? "Re-Analyze Data" : "Generate Scout Report"}
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
                <AnimatePresence mode="wait">
                    {aiReport ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl">
                                <p className="text-sm italic leading-relaxed text-foreground/80">"{aiReport.summary}"</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Dominant Force</p>
                                    <p className="text-base font-bold text-accent">{aiReport.topTeam}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Key Performer</p>
                                    <p className="text-base font-bold text-accent">{aiReport.topPlayer}</p>
                                </div>
                                <div className="sm:col-span-2 space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Tactical Alert</p>
                                    <p className="text-xs font-medium text-destructive">{aiReport.alert}</p>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <Sparkles className="h-6 w-6 text-muted-foreground/30" />
                            </div>
                            <p className="text-sm text-muted-foreground">Click generate to let AI analyze the current tournament momentum.</p>
                        </div>
                    )}
                </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="glass-card border-white/5 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="text-lg font-bold">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-6">
                {stats.map(s => (
                  <div key={s.label} className="flex justify-between items-end border-b border-white/5 pb-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
                    {loading ? (
                      <Skeleton className="h-8 w-16 opacity-10" />
                    ) : (
                      <p className="text-2xl font-black text-foreground">{s.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-accent/20 bg-accent/5 overflow-hidden">
            <CardHeader className="bg-accent/10 border-b border-accent/10">
              <CardTitle className="text-sm font-black tracking-widest uppercase italic">Admin Protocol</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-xs leading-relaxed opacity-80">
                {teams.length === 0 ? (
                    "Initialize the tournament by deploying teams and registering elite athletes via the registry."
                ) : players.length < (teams.length * 4) ? (
                    "Some clubs have insufficient athlete registration. Protocol requires 4+ per team for group mode stability."
                ) : (
                    "The DFPL network is fully operational. Public broadcasts will reflect live data changes in real-time."
                )}
              </p>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Persistent Data Policy Enabled
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
