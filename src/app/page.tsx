'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, UserSquare, Moon, Sun, Instagram, Mail, ListOrdered } from 'lucide-react';
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
      {theme === 'light' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
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
      className="space-y-8 py-8 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.section
        className="text-center py-12 bg-card rounded-lg shadow-lg relative"
        variants={sectionVariants}
      >
        <div className="absolute top-4 right-4">
          <ThemeSwitcher />
        </div>
        <div className="flex justify-center items-center mb-4">
           <Image
              src="/images/logos/League.png"
              alt="Dongre Premier League Logo"
              width={60}
              height={60}
              className="rounded-full"
              priority
            />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">
          Dongre Football Premier League
        </h1>
        <p className="text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Welcome to the official tracker for the Dongre Football Premier League!
        </p>
      </motion.section>

      <motion.section variants={sectionVariants}>
        <h2 className="text-3xl font-bold mb-6 text-center">Explore the League</h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
        >
          <motion.div variants={cardVariants}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xl font-semibold">Teams</span>
                </CardTitle>
                <CardDescription>View participating teams and their details.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/teams">Go to Teams</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={cardVariants}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                   <div className="bg-primary/10 p-2 rounded-full">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xl font-semibold">Matches</span>
                </CardTitle>
                <CardDescription>Check the schedule and results of matches.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/matches">Go to Matches</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={cardVariants}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                   <div className="bg-primary/10 p-2 rounded-full">
                    <UserSquare className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xl font-semibold">Players</span>
                </CardTitle>
                <CardDescription>Browse player profiles and season info.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/players">Go to Players</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={cardVariants}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <ListOrdered className="w-6 h-6 text-primary" />
                   </div>
                  <span className="text-xl font-semibold">Standings</span>
                </CardTitle>
                <CardDescription>View the current league standings.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/standings">Go to Standings</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section
        className="text-center text-muted-foreground text-md py-8"
        variants={sectionVariants}
      >
        <p>Currently tracking Season 3. Stay tuned for live updates, standings, and detailed statistics!</p>
      </motion.section>

      <motion.section
        className="text-center py-12 bg-card rounded-lg shadow-lg"
        variants={sectionVariants}
      >
        <h2 className="text-3xl font-bold mb-4">Connect With Us</h2>
        <p className="text-muted-foreground mb-6">Follow us on social media and get in touch.</p>
        <div className="flex justify-center gap-8">
          <a href="https://www.instagram.com/dongrefootballclub/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-primary hover:text-primary/80 transition-colors">
            <Instagram className="w-10 h-10" />
          </a>
          <a href="mailto:dfplowners@gmail.com" aria-label="Email" className="text-primary hover:text-primary/80 transition-colors">
            <Mail className="w-10 h-10" />
          </a>
        </div>
      </motion.section>
    </motion.div>
  );
}
