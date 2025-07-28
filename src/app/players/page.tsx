'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserSquare, TrendingUp, Shield, Star, CalendarDays, Users } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Player } from '@/types';
import { fetchPlayers } from '@/lib/api';

const positionMapping: { [key: string]: string } = {
  'FW': 'Forward',
  'MF': 'Midfield',
  'DEF': 'Defence',
  'Over the field': 'Versatile'
};

const footMapping: { [key: string]: string } = {
  'R': 'Right',
  'L': 'Left',
};

const categoryColors: { [key: string]: string } = {
    '5★': 'border-blue-300 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
    '4★': 'border-purple-300 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700',
    '3★': 'border-orange-300 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700',
};

function formatPosition(positions: string[] | undefined): string {
  if (!positions) return 'N/A';
  return positions.map(p => positionMapping[p] || p).join(', ');
}

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } },
};

const tableVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPlayers = async () => {
      try {
        const data = await fetchPlayers();
        setPlayers(data);
      } catch (err) {
        setError("Failed to load players.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    getPlayers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Loading players...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <motion.div
        className="flex justify-between items-center"
        variants={itemVariants}
      >
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserSquare className="w-8 h-8 text-primary" />
          Players (Season 3)
        </h1>
      </motion.div>
      <motion.p
        className="text-muted-foreground"
        variants={itemVariants}
      >
        List of players participating in the current season. Click on a player row to view detailed stats.
      </motion.p>
      <motion.div variants={tableVariants}>
        <Card>
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {players.map((player, index) => (
                <AccordionItem value={`player-${player.id}`} key={player.id} className="border-b last:border-b-0">
                  <AccordionTrigger className="hover:bg-muted/50 cursor-pointer flex items-center justify-between py-4 px-4 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="font-medium w-[80px]">{player.id}</div>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <Image
                            src={`/images/players/player-${player.id}.png`}
                            alt={`${player.name} avatar`}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                            priority={index < 5}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `https://picsum.photos/seed/${player.id}/40/40`;
                            }}
                          />
                          <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{player.name}</span>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                             <Users className="w-3 h-3 text-muted-foreground"/>
                            <span>{player.team}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                   <div className="bg-muted/5 dark:bg-muted/10 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1 p-3 bg-card rounded-md shadow-sm">
                        <h4 className="font-semibold text-sm flex items-center gap-1"><CalendarDays className="w-4 h-4 text-primary"/>Age</h4>
                        <p className="text-muted-foreground">{player.age ?? 'N/A'}</p>
                      </div>
                      <div className="space-y-1 p-3 bg-card rounded-md shadow-sm">
                        <h4 className="font-semibold text-sm flex items-center gap-1"><Star className="w-4 h-4 text-primary"/>Category</h4>
                        <Badge variant="outline" className={cn("font-bold", categoryColors[player.category] ?? '')}>
                          {player.category}
                        </Badge>
                      </div>
                      <div className="space-y-1 p-3 bg-card rounded-md shadow-sm">
                        <h4 className="font-semibold text-sm flex items-center gap-1"><Shield className="w-4 h-4 text-primary"/>Base Price</h4>
                        <p className="text-muted-foreground">{player.basePrice}</p>
                      </div>
                      <div className="space-y-1 p-3 bg-card rounded-md shadow-sm">
                        <h4 className="font-semibold text-sm flex items-center gap-1"><UserSquare className="w-4 h-4 text-primary"/>Preferred Position</h4>
                        <p className="text-muted-foreground">{formatPosition(player.preferredPosition)}</p>
                      </div>
                      <div className="space-y-1 p-3 bg-card rounded-md shadow-sm">
                        <h4 className="font-semibold text-sm flex items-center gap-1">Foot</h4>
                        <p className="text-muted-foreground">{footMapping[player.preferredFoot] ?? player.preferredFoot}</p>
                      </div>
                      <div className="space-y-1 p-3 bg-card rounded-md shadow-sm">
                        <h4 className="font-semibold text-sm flex items-center gap-1"><TrendingUp className="w-4 h-4 text-primary"/>Remarks</h4>
                        <ul className="text-muted-foreground list-disc list-inside">
                          {player.remarks && player.remarks.map((remark, i) => <li key={i}>{remark}</li>)}
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>
       <motion.div
        className="mt-4 p-4 border rounded-lg bg-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
       >
          <h3 className="font-semibold mb-2 text-card-foreground">Key Abbreviations:</h3>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li><span className="font-medium">Over the field:</span> All playing positions</li>
            <li><span className="font-medium">FW:</span> Forward/Attacking</li>
            <li><span className="font-medium">MF:</span> Midfield</li>
            <li><span className="font-medium">DEF:</span> Defence</li>
            <li><span className="font-medium">R:</span> Right Footed</li>
            <li><span className="font-medium">L:</span> Left Footed</li>
            <li><span className="font-medium">Wall:</span> Good defending skills</li>
            <li><span className="font-medium">In the box:</span> Always stays forward</li>
          </ul>
        </motion.div>
    </motion.div>
  );
}
