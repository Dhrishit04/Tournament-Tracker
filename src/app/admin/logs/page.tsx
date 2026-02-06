
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tighter italic uppercase">Audit <span className="text-accent">Logs</span></h1>
          <p className="text-muted-foreground font-medium">Real-time system monitoring and event tracking.</p>
        </div>
        <div className="flex gap-3">
            <Button 
                onClick={handleDownloadLogs} 
                disabled={logs.length === 0}
                variant="outline"
                className="glass-card border-white/10 hover:bg-white/5 h-12 px-6 rounded-xl font-bold"
            >
                <Download className="mr-2 h-4 w-4" /> Download .txt
            </Button>
            <Button 
                onClick={handleClearLogs} 
                disabled={logs.length === 0}
                variant="destructive"
                className="h-12 px-6 rounded-xl font-bold"
            >
                <Trash2 className="mr-2 h-4 w-4" /> Purge History
            </Button>
        </div>
      </div>

      <Card className="glass-card border-accent/20 bg-accent/5 overflow-hidden">
        <CardHeader className="bg-accent/10 border-b border-accent/10 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-accent" />
            <div>
              <CardTitle className="text-lg font-black uppercase italic tracking-tight">Logging Protocol</CardTitle>
              <CardDescription className="text-xs">Toggle the recording of administrative events</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-background/40 px-4 py-2 rounded-full border border-white/10">
            <Label htmlFor="logging-toggle" className="text-[10px] font-black uppercase tracking-widest text-accent">
                {isLoggingEnabled ? "Active" : "Paused"}
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

      <Card className="border-white/5 bg-black overflow-hidden shadow-2xl rounded-2xl">
        <CardHeader className="bg-white/5 border-b border-white/5 flex flex-row items-center justify-between py-3">
            <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="h-4 w-px bg-white/10 mx-2" />
                <div className="flex items-center gap-2 text-white/40">
                    <Terminal className="h-3 w-3" />
                    <span className="text-[10px] font-mono uppercase tracking-widest">system_audit_terminal</span>
                </div>
            </div>
            <span className="text-[10px] font-mono text-white/20 uppercase">v1.0.4-stable</span>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] w-full bg-[#0a0a0a]">
            {loading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-4 w-[80%] bg-white/5" />
                <Skeleton className="h-4 w-[60%] bg-white/5" />
                <Skeleton className="h-4 w-[70%] bg-white/5" />
              </div>
            ) : sortedLogs.length > 0 ? (
              <div className="p-6 font-mono text-xs md:text-sm leading-relaxed whitespace-pre select-all">
                {sortedLogs.map((log) => (
                  <div key={log.id} className="mb-1.5 group flex gap-4">
                    <p className="text-white/80 break-all">
                        <span className="text-green-500/70">[{format(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}]</span>{' '}
                        <span className="text-blue-400/80 font-bold">{log.adminEmail}</span>{' '}
                        <span className="text-white/30">|</span>{' '}
                        <span className="text-accent/80 font-bold">{log.action}</span>: {' '}
                        <span className="text-white/60 italic">{log.details}</span>
                    </p>
                  </div>
                ))}
                <div className="mt-4 flex items-center gap-2 text-white/20 animate-pulse">
                    <span className="w-2 h-4 bg-accent/50" />
                    <span className="italic">Waiting for incoming events...</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-white/20 italic font-mono uppercase tracking-widest text-xs">
                <ShieldAlert className="h-12 w-12 mb-4 opacity-10" />
                <p>NULL_LOG_BUFFER: No records found</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
