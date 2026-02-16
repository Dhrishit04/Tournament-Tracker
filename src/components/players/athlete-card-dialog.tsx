'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { type Player, type Team } from '@/types';
import Image from 'next/image';
import { getImageUrl, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Goal, Footprints, Shield, User, Info, Trophy, TrendingUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div 
            className={cn("h-full transition-all duration-1000 ease-out", colorClass)}
            style={{ width: `${percentage}%` }}
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
        "w-[95vw] sm:max-w-md p-0 glass-card overflow-hidden border-2",
        isClassA ? "border-accent/40 shadow-[0_0_50px_rgba(255,87,34,0.1)]" : 
        isClassB ? "border-blue-500/40 shadow-[0_0_50px_rgba(59,130,246,0.1)]" : "border-white/10"
      )}>
        <DialogHeader className="sr-only">
          <DialogTitle>{player.name} Scout Card</DialogTitle>
          <DialogDescription>Detailed performance metrics and athlete profile for {player.name}.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          {/* Elite Background elements */}
          <div className={cn(
            "absolute inset-0 opacity-10 pointer-events-none",
            isClassA ? "bg-gradient-to-b from-accent to-transparent" : "bg-gradient-to-b from-blue-500 to-transparent"
          )} />
          
          <div className="relative p-6 md:p-8 space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={cn(
                "relative w-32 h-32 rounded-3xl overflow-hidden border-4 shadow-2xl transition-transform duration-500 hover:scale-105",
                isClassA ? "border-accent shadow-accent/20" : "border-white/10"
              )}>
                <Image src={avatar.imageUrl} alt={player.name} fill className="object-cover" data-ai-hint={avatar.imageHint} />
              </div>
              
              <div className="space-y-1">
                <Badge variant="outline" className={cn(
                  "text-[10px] font-black tracking-[0.3em] uppercase px-4 py-1 rounded-full border-2",
                  isClassA ? "text-accent border-accent/30 bg-accent/5" : "text-blue-400 border-blue-400/30 bg-blue-400/5"
                )}>
                  Class {player.category} Athlete
                </Badge>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{player.name}</h2>
                {team && (
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
                    <Shield className="h-3 w-3 text-accent" /> {team.name}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Primary Role</span>
                <span className="text-xs font-bold uppercase truncate w-full">{player.preferredPosition?.join(', ') || 'Athletic'}</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Total Involvement</span>
                <span className="text-xs font-bold uppercase">{totalInvolvement} Contributions</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Performance Metrics</span>
              </div>
              
              <div className="space-y-5">
                <StatBar 
                  label="Goals Scored" 
                  value={player.goals || 0} 
                  max={20} 
                  icon={Goal} 
                  colorClass="bg-accent" 
                />
                <StatBar 
                  label="Assists Logged" 
                  value={player.assists || 0} 
                  max={20} 
                  icon={Footprints} 
                  colorClass="bg-blue-500" 
                />
                <StatBar 
                  label="Matches Logged" 
                  value={player.matchesPlayed || 0} 
                  max={15} 
                  icon={Shield} 
                  colorClass="bg-green-500" 
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-white/5">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[8px] font-black uppercase opacity-40">Age</p>
                  <p className="text-sm font-bold">{player.age || 'N/A'}</p>
                </div>
                <Separator orientation="vertical" className="h-8 bg-white/5" />
                <div>
                  <p className="text-[8px] font-black uppercase opacity-40">Preferred Foot</p>
                  <p className="text-sm font-bold">{player.preferredFoot || 'Right'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {player.yellowCards > 0 && (
                  <div className="w-4 h-6 bg-yellow-400/80 rounded-sm border border-black/20" title={`${player.yellowCards} Yellow Cards`} />
                )}
                {player.redCards > 0 && (
                  <div className="w-4 h-6 bg-red-600/80 rounded-sm border border-black/20" title={`${player.redCards} Red Cards`} />
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
