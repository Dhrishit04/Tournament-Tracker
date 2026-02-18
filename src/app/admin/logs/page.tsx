'use client';

import { useAuth } from '@/hooks/use-auth';
import { useSeason } from '@/contexts/season-context';
import { useCollection, useFirestore } from '@/firebase';
import { type LogEntry } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, Trash2, ShieldAlert, Activity, Terminal } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { AccessDenied } from '@/components/admin/access-denied';
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLogsPage() {
  const { isSystemAdmin } = useAuth();
  const { isLoggingEnabled, setLoggingEnabled } = useSeason();
  const firestore = useFirestore();
  const { data: logs, loading } = useCollection<LogEntry>('logs');
  const { toast } = useToast();

  if (!isSystemAdmin) {
    return <AccessDenied />;
  }

  // Sort logs by timestamp descending
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);

  const formatLogLine = (log: LogEntry) => {
    return `[${format(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}] ${log.adminEmail} | ${log.action}: ${log.details}`;
  };

  const getActionColor = (action: string) => {
    const a = action.toUpperCase();
    if (a.includes('ADD') || a.includes('CREATE') || a.includes('REGISTRY_ADD')) return 'text-green-400';
    if (a.includes('DELETE') || a.includes('REMOVE') || a.includes('WIPE') || a.includes('ERASE') || a.includes('TERMINATE')) return 'text-red-400';
    if (a.includes('UPDATE') || a.includes('EDIT') || a.includes('SWITCH') || a.includes('CONFIG') || a.includes('BROADCAST')) return 'text-yellow-400';
    return 'text-blue-400';
  };

  const handleDownloadLogs = () => {
    if (logs.length === 0) return;

    const logContent = sortedLogs.map(formatLogLine).join('\n');

    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dfpl_logs.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({ title: "Export Complete", description: "Audit trail downloaded as dfpl_logs.txt" });
  };

  const handleClearLogs = async () => {
    if (!firestore) return;
    const batch = writeBatch(firestore);
    const snap = await getDocs(collection(firestore, 'logs'));
    snap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    toast({ title: "Logs Purged", description: "Audit history has been cleared from the database." });
  };

  return (
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tighter italic uppercase">System <span className="text-accent">Terminal</span></h1>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Infrastructure audit and security monitoring.</p>
        </div>
        <div className="flex gap-3">
            <Button 
                onClick={handleDownloadLogs} 
                disabled={logs.length === 0}
                variant="outline"
                className="glass-card border-white/10 hover:bg-white/5 h-12 px-6 rounded-xl font-bold transition-all hover:scale-105"
            >
                <Download className="mr-2 h-4 w-4" /> Export Txt
            </Button>
            <Button 
                onClick={handleClearLogs} 
                disabled={logs.length === 0}
                variant="destructive"
                className="h-12 px-6 rounded-xl font-bold transition-all hover:scale-105"
            >
                <Trash2 className="mr-2 h-4 w-4" /> Purge History
            </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card border-accent/20 bg-accent/5 overflow-hidden shadow-2xl">
            <CardHeader className="bg-accent/10 border-b border-accent/10 flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Activity className="h-6 w-6 text-accent" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500 animate-ping" />
                </div>
                <div>
                <CardTitle className="text-sm font-black uppercase italic tracking-widest">Protocol Monitor</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold opacity-60">Master Authority Oversight</CardDescription>
                </div>
            </div>
            <div className="flex items-center gap-4 bg-background/40 px-4 py-2 rounded-full border border-white/10 shadow-inner">
                <Label htmlFor="logging-toggle" className="text-[10px] font-black uppercase tracking-widest text-accent">
                    {isLoggingEnabled ? "Monitoring Active" : "Audit Paused"}
                </Label>
                <Switch 
                    id="logging-toggle"
                    checked={isLoggingEnabled}
                    onCheckedChange={setLoggingEnabled}
                    className="data-[state=checked]:bg-accent"
                />
            </div>
            </CardHeader>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-white/5 bg-[#050505] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-2xl border-2">
            <CardHeader className="bg-white/5 border-b border-white/5 flex flex-row items-center justify-between py-3 px-6">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50" />
                    </div>
                    <div className="h-4 w-px bg-white/10 mx-2" />
                    <div className="flex items-center gap-2 text-white/40">
                        <Terminal className="h-3 w-3" />
                        <span className="text-[10px] font-mono uppercase tracking-widest font-black">dfpl_root_authority_session</span>
                    </div>
                </div>
                <span className="text-[10px] font-mono text-white/20 uppercase font-black">v1.2.0-stable</span>
            </CardHeader>
            <CardContent className="p-0">
            <ScrollArea className="h-[600px] w-full bg-[#050505]">
                {loading ? (
                <div className="p-8 space-y-4">
                    <Skeleton className="h-4 w-[80%] bg-white/5" />
                    <Skeleton className="h-4 w-[60%] bg-white/5" />
                    <Skeleton className="h-4 w-[70%] bg-white/5" />
                    <Skeleton className="h-4 w-[50%] bg-white/5" />
                </div>
                ) : sortedLogs.length > 0 ? (
                <div className="p-8 font-mono text-xs md:text-sm leading-relaxed whitespace-pre select-all">
                    <AnimatePresence mode="popLayout">
                        {sortedLogs.map((log, idx) => (
                        <motion.div 
                            key={log.id} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(idx * 0.02, 1) }}
                            className="mb-2 group flex flex-col md:flex-row md:items-center gap-1 md:gap-4 hover:bg-white/[0.04] transition-colors -mx-4 px-4 py-1"
                        >
                            <span className="text-white/20 whitespace-nowrap">[{format(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}]</span>
                            <p className="text-white/80 break-all">
                                <span className="text-blue-400 font-black">{log.adminEmail}</span>{' '}
                                <span className="text-white/20 font-bold">»</span>{' '}
                                <span className={cn("font-black", getActionColor(log.action))}>{log.action}</span>{' '}
                                <span className="text-white/10 mx-1">:</span>{' '}
                                <span className="text-white/50 italic font-medium">{log.details}</span>
                            </p>
                        </motion.div>
                        ))}
                    </AnimatePresence>
                    <div className="mt-8 flex items-center gap-3 text-white/10 animate-pulse border-t border-white/5 pt-4">
                        <span className="w-2 h-4 bg-accent/50" />
                        <span className="italic uppercase font-black text-[10px] tracking-widest">Listening for incoming audit packets...</span>
                    </div>
                </div>
                ) : (
                <div className="flex flex-col items-center justify-center h-[500px] text-white/10 italic font-mono uppercase tracking-widest text-xs">
                    <Terminal className="h-16 w-16 mb-6 opacity-5" />
                    <p>NULL_LOG_BUFFER: NO RECORDS DETECTED</p>
                </div>
                )}
            </ScrollArea>
            </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
