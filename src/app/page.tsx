'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, UserSquare, Moon, Sun, Instagram, Mail, ListOrdered, Image as ImageIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';


function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled aria-label="Loading theme switcher">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      {theme === 'light' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem] अवकाश" />}
    </Button>
  );
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};


export default function Home() {
  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.section
        className="text-center py-12 bg-card rounded-lg shadow relative"
        variants={sectionVariants}
      >
        <div className="absolute top-4 right-4">
          <ThemeSwitcher />
        </div>
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
           <Image
              src="/images/logos/League.png"
              alt="Dongre Premier League Logo"
              width={50}
              height={50}
              className="rounded-full"
              data-ai-hint="football league logo soccer"
              priority={true}
            />
          Dongre Football Premier League
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome to the official tracker for the Dongre Football Premier League!
        </p>
      </motion.section>

      <motion.section variants={sectionVariants}>
        <h2 className="text-2xl font-semibold mb-4 text-center">Explore the League</h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center md:justify-items-stretch"
          variants={containerVariants}
        >
          <motion.div variants={cardVariants} className="w-full max-w-sm md:max-w-none aspect-[4/3] md:aspect-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Teams
                </CardTitle>
                <CardDescription>View participating teams and their details.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/teams">Go to Teams</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={cardVariants} className="w-full max-w-sm md:max-w-none aspect-[4/3] md:aspect-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Matches
                </CardTitle>
                <CardDescription>Check the schedule and results of matches.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/matches">Go to Matches</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={cardVariants} className="w-full max-w-sm md:max-w-none aspect-[4/3] md:aspect-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserSquare className="w-5 h-5 text-primary" />
                  Players
                </CardTitle>
                <CardDescription>Browse player profiles and season info.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/players">Go to Players</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={cardVariants} className="w-full max-w-sm md:max-w-none aspect-[4/3] md:aspect-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-primary" />
                  Table Standings
                </CardTitle>
                <CardDescription>View the current league standings.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/standings">Go to Standings</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section
        className="text-center text-muted-foreground text-sm"
        variants={sectionVariants}
      >
        <p>Currently tracking Season 3. Stay tuned for live updates, standings, and detailed statistics!</p>
      </motion.section>

      <motion.section
        className="text-center py-12"
        variants={sectionVariants}
      >
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <div className="flex justify-center gap-6">
          <a href="https://www.instagram.com/dongrefootballclub/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <Instagram className="w-8 h-8 text-primary hover:opacity-80 transition-opacity" />
          </a>
          <a href="mailto:dfplowners@gmail.com" aria-label="Email">
            <Mail className="w-8 h-8 text-primary hover:opacity-80 transition-opacity" />
          </a>
        </div>
      </motion.section>
    </motion.div>
  );
}
