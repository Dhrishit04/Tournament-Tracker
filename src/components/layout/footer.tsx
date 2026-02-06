import Link from 'next/link';
import { Mail, Instagram, Shield, Github } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-card border-t border-white/5 text-card-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-accent rounded-lg p-1.5 transition-transform group-hover:rotate-12">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="font-black text-3xl tracking-tighter italic">DFPL</span>
            </Link>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              The official platform for the Dongre Football Premier League. Tracking greatness, one goal at a time. Join the elite community of football enthusiasts.
            </p>
            <div className="flex gap-5">
              <a href="https://www.instagram.com/dongrefootballclub/?hl=en" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-2 rounded-full hover:bg-accent hover:text-white transition-all">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="mailto:dfplowners@gmail.com" className="bg-white/5 p-2 rounded-full hover:bg-accent hover:text-white transition-all">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-widest text-accent">Platform</h3>
            <ul className="space-y-4">
               <li><Link href="/standings" className="text-muted-foreground hover:text-white transition-colors">Standings</Link></li>
               <li><Link href="/teams" className="text-muted-foreground hover:text-white transition-colors">Clubs</Link></li>
               <li><Link href="/players" className="text-muted-foreground hover:text-white transition-colors">Athletes</Link></li>
               <li><Link href="/matches" className="text-muted-foreground hover:text-white transition-colors">Live Match Center</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-widest text-accent">Admin</h3>
            <ul className="space-y-4">
                <li><Link href="/admin-auth" className="text-muted-foreground hover:text-white transition-colors">Portal Login</Link></li>
                <li><Link href="/admin" className="text-muted-foreground hover:text-white transition-colors">Command Center</Link></li>
                <li><Link href="/admin/settings" className="text-muted-foreground hover:text-white transition-colors">Season Config</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {year} DONGRE FOOTBALL PREMIER LEAGUE. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <button className="hover:text-white transition-colors">PRIVACY POLICY</button>
            <button className="hover:text-white transition-colors">TERMS OF SERVICE</button>
          </div>
        </div>
      </div>
    </footer>
  );
}