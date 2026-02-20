'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { type Player, type Team } from '@/types';
import Image from 'next/image';
import { getImageUrl, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Goal, Footprints, Shield, TrendingUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

interface AthleteCardDialogProps {
  player: Player | null;
  team?: Team;
  isOpen: boolean;
  onClose: () => void;
}

export function AthleteCardDialog({ player, team, isOpen, onClose }: AthleteCardDialogProps) {
  if (!player) return null;

  const avatar = getImageUrl(player.avatarUrl);
  const totalInvolvement = (player.goals || 0) + (player.assists || 0);
  
  const StatBar = ({ label, value, max, icon: Icon, colorClass }: { label: string, value: number, max: number, icon: any, colorClass: string }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <Icon className="h-3 w-3 opacity-50" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
          </div>
          <span className="font-mono font-black text-sm">{value}</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className={cn("h-full", colorClass)}
          />
        </div>
      </div>
    );
  };

  const isClassA = player.category === 'A';
  const isClassB = player.category === 'B';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "w-[92vw] sm:max-w-md p-0 glass-card overflow-hidden border-2 flex flex-col max-h-[92vh] gap-0",
        isClassA ? "border-accent/40 shadow-[0_0_80px_rgba(255,87,34,0.2)]" : 
        isClassB ? "border-blue-500/40 shadow-[0_0_80px_rgba(59,130,246,0.2)]" : "border-white/10"
      )}>
        <DialogHeader className="sr-only">
          <DialogTitle>{player.name} Scout Card</DialogTitle>
          <DialogDescription>Detailed performance metrics and athlete profile for {player.name}.</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className={cn(
              "absolute inset-0 h-64 opacity-20 pointer-events-none",
              isClassA ? "bg-gradient-to-b from-accent to-transparent" : "bg-gradient-to-b from-blue-500 to-transparent"
            )} />
            
            <div className="relative p-6 md:p-8 space-y-6 md:space-y-8 pb-10">
              <div className="flex flex-col items-center text-center space-y-4 pt-2">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                    "relative w-28 h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 shadow-2xl transition-all duration-700",
                    isClassA ? "border-accent shadow-accent/30" : "border-white/10"
                    )}
                >
                  <Image src={avatar.imageUrl} alt={player.name} fill className="object-cover" data-ai-hint={avatar.imageHint} />
                </motion.div>
                
                <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-1"
                >
                  <Badge variant="outline" className={cn(
                    "text-[9px] md:text-[10px] font-black tracking-[0.25em] uppercase px-4 py-1 rounded-full border-2",
                    isClassA ? "text-accent border-accent/30 bg-accent/5" : "text-blue-400 border-blue-400/30 bg-blue-400/5"
                  )}>
                    Class {player.category} Athlete
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase leading-none mt-2">{player.name}</h2>
                  {team && (
                    <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2 mt-1">
                      <Shield className="h-3 w-3 text-accent" /> {team.name}
                    </p>
                  )}
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-3 md:gap-4"
              >
                <div className="bg-white/5 p-3 md:p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center shadow-inner">
                  <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Primary Role</span>
                  <span className="text-[10px] md:text-xs font-bold uppercase truncate w-full">{player.preferredPosition?.join(', ') || 'Athletic'}</span>
                </div>
                <div className="bg-white/5 p-3 md:p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center shadow-inner">
                  <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Total Involvement</span>
                  <span className="text-[10px] md:text-xs font-bold uppercase">{totalInvolvement} Contributions</span>
                </div>
              </motion.div>

              <div className="space-y-5 md:space-y-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Performance Analytics</span>
                </div>
                
                <div className="space-y-4 md:space-y-5">
                  <StatBar 
                    label="Goals Scored" 
                    value={player.goals || 0} 
                    max={20} 
                    icon={Goal} 
                    colorClass="bg-accent shadow-[0_0_10px_rgba(255,87,34,0.5)]" 
                  />
                  <StatBar 
                    label="Assists Logged" 
                    value={player.assists || 0} 
                    max={20} 
                    icon={Footprints} 
                    colorClass="bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                  />
                  <StatBar 
                    label="Matches Logged" 
                    value={player.matchesPlayed || 0} 
                    max={15} 
                    icon={Shield} 
                    colorClass="bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                  />
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-4 flex items-center justify-between border-t border-white/5"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[7px] md:text-[8px] font-black uppercase opacity-40">Age</p>
                    <p className="text-xs md:text-sm font-bold">{player.age || 'N/A'}</p>
                  </div>
                  <Separator orientation="vertical" className="h-8 bg-white/10" />
                  <div>
                    <p className="text-[7px] md:text-[8px] font-black uppercase opacity-40">Preferred Foot</p>
                    <p className="text-xs md:text-sm font-bold">{player.preferredFoot || 'Right'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {player.yellowCards > 0 && (
                    <div className="w-3 md:w-4 h-5 md:h-6 bg-yellow-400/80 rounded-sm border border-black/20 animate-in fade-in zoom-in" title={`${player.yellowCards} Yellow Cards`} />
                  )}
                  {player.redCards > 0 && (
                    <div className="w-3 md:w-4 h-5 md:h-6 bg-red-600/80 rounded-sm border border-black/20 animate-in fade-in zoom-in" title={`${player.redCards} Red Cards`} />
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
