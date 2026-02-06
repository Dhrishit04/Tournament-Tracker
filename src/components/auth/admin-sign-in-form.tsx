
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
      
      // Handle Firebase specific errors if they occur
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
    <Card className="w-full max-w-sm glass-card border-accent/20 bg-background/50 overflow-hidden">
      <CardHeader className="bg-accent/10 border-b border-accent/10 pb-8">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-accent/20 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-accent" />
            </div>
            <CardTitle className="text-2xl font-black italic tracking-tighter uppercase">Admin <span className="text-accent">Portal</span></CardTitle>
        </div>
        <CardDescription className="text-xs font-medium opacity-70">Authorized personnel only. Credentials verified via Registry.</CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive animate-in fade-in zoom-in-95">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-xs font-black uppercase tracking-widest">Access Denied</AlertTitle>
                <AlertDescription className="text-[10px] italic">{error}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Identity Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@dfpl.com" {...field} className="glass-card bg-background/50 h-12" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Security Key</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        {...field} 
                        className="glass-card bg-background/50 h-12 pr-10" 
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
            <Button type="submit" className="w-full h-12 bg-accent hover:bg-accent/90 font-black italic uppercase tracking-tighter shadow-lg" disabled={loading}>
              {loading ? 'Verifying...' : 'Establish Session'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
