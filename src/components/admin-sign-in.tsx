import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const AdminSignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (typeof window !== 'undefined' && (window as any).firebase) {
      const firebase = (window as any).firebase;
      const auth = firebase.auth();

      try {
        await auth.signInWithEmailAndPassword(email, password);
        // User signed in successfully.
        // Check for admin role before redirecting (implementation depends on how roles are stored)
        // For now, directly redirecting.
        // Add a small delay to allow Firebase to propagate auth state
        toast({
          title: 'Login Successful',
          description: 'Redirecting to admin dashboard...',
        });
        setTimeout(() => {
          window.location.href = '/admin'; // Redirect to the admin page
        }, 1000);

      } catch (error: any) {
        console.error('Error signing in:', error);
        toast({
          title: 'Login Failed',
          description: error.message || 'Invalid credentials or network error.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    } else {
      toast({
        title: 'Error',
        description: 'Firebase is not available. Please try again later.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email (Username)</Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@example.com"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
       <p className="text-xs text-muted-foreground text-center">
        Note: Ensure Email/Password sign-in is enabled in your Firebase project and an admin user exists.
      </p>
    </div>
  );
};
AdminSignIn.displayName = 'AdminSignIn';

export default AdminSignIn;
