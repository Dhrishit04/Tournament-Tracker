
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function AdminSignInForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    setLoading(true);
    try {
      await login(values.email, values.password);
      toast({
        title: 'Login Successful',
        description: 'Authorized session established.',
      });
      router.push('/admin');
    } catch (err: any) {
      console.error("Login attempt failed:", err);
      let errorMessage = 'Invalid email or password. Please verify your credentials.';

      if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many login attempts. System locked for safety. Try later.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network connection failure. Check your internet.';
      }

      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Unauthorized',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm relative border-accent/20 bg-card overflow-hidden shadow-2xl">
      {/* Animated glow border effect */}
      <div className="absolute inset-0 rounded-[inherit] pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -inset-[1px] rounded-[inherit] opacity-30"
          style={{
            background: 'conic-gradient(from 0deg, transparent, hsl(var(--accent)), transparent, transparent)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show">
        <CardHeader className="bg-accent/10 border-b border-accent/10 pb-8 relative">
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
            <motion.div
              className="p-2 bg-accent/20 rounded-lg"
              animate={{ boxShadow: ['0 0 0px hsl(var(--accent))', '0 0 20px hsl(var(--accent))', '0 0 0px hsl(var(--accent))'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ShieldCheck className="h-6 w-6 text-accent" />
            </motion.div>
            <CardTitle className="text-2xl font-black italic tracking-tighter uppercase">Admin <span className="text-accent">Portal</span></CardTitle>
          </motion.div>
          <motion.div variants={fadeUp}>
            <CardDescription className="text-xs font-medium text-muted-foreground">Authorized personnel only. Credentials verified via Registry.</CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="pt-8 relative">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-xs font-black uppercase tracking-widest">Access Denied</AlertTitle>
                    <AlertDescription className="text-[10px] italic">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              <motion.div variants={fadeUp}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Identity Email</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@dfpl.com" {...field} className="bg-background/50 h-12 border-border" />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Security Key</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="bg-background/50 h-12 pr-10 border-border"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-white/5 opacity-40 hover:opacity-100"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <Button type="submit" className="w-full h-12 bg-accent hover:bg-accent/90 font-black italic uppercase tracking-tighter shadow-lg transition-all hover:shadow-accent/30 hover:shadow-xl" disabled={loading}>
                  {loading ? (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      Verifying...
                    </motion.span>
                  ) : 'Establish Session'}
                </Button>
              </motion.div>
            </form>
          </Form>
        </CardContent>
      </motion.div>
    </Card>
  );
}

