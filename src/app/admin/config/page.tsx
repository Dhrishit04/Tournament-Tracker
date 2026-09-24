'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, ShieldAlert, Key, Mail, Trash2, Save, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useCollection, useFirestore, useFunctions } from '@/firebase';
import { httpsCallable } from 'firebase/functions';
import { updateEmail, updatePassword, getAuth } from 'firebase/auth';
import { type AdminProfile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { AccessDenied } from '@/components/admin/access-denied';
import { useData } from '@/hooks/use-data';

type ManageAction = 'create' | 'toggleSettings' | 'delete' | 'rotatePassword';

export default function AdminConfigPage() {
  const { user, isSystemAdmin } = useAuth();
  const firestore = useFirestore();
  const functions = useFunctions();
  const { data: adminRegistry, loading: registryLoading } = useCollection<AdminProfile>('admins');
  const { toast } = useToast();
  const { logAction } = useData();

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminCanAccessSettings, setNewAdminCanAccessSettings] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingActionUid, setPendingActionUid] = useState<string | null>(null);

  const [isUpdatingSelf, setIsUpdatingSelf] = useState(false);
  const [selfEmail, setSelfEmail] = useState('');
  const [selfPassword, setSelfPassword] = useState('');

  useEffect(() => {
    if (user?.email) {
      setSelfEmail(user.email);
    }
  }, [user?.email]);

  if (!isSystemAdmin) {
    return <AccessDenied />;
  }

  const callManageAdmin = useCallback(
    async (payload: { action: ManageAction; [k: string]: unknown }) => {
      if (!functions) throw new Error('Cloud Functions not initialized');
      const fn = httpsCallable<{ action: ManageAction; [k: string]: unknown }, { uid?: string; passwordResetLink?: string; canAccessSettings?: boolean }>(
        functions,
        'manageAdmin'
      );
      return fn(payload);
    },
    [functions]
  );

  const handleUpdateSelf = async () => {
    const auth = getAuth();
    if (!auth.currentUser) return;

    setIsUpdatingSelf(true);
    try {
      if (selfEmail !== user?.email) {
        await updateEmail(auth.currentUser, selfEmail);
      }
      if (selfPassword) {
        await updatePassword(auth.currentUser, selfPassword);
      }
      logAction("AUTH_UPDATE", `System Admin updated their own credentials.`);
      toast({ title: 'Success', description: 'System Admin credentials updated.' });
      setSelfPassword('');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    } finally {
      setIsUpdatingSelf(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail) return;
    const normalizedEmail = newAdminEmail.toLowerCase().trim();

    if (normalizedEmail === user?.email?.toLowerCase()) {
      toast({ variant: 'destructive', title: 'Invalid Identity', description: 'Cannot add System Admin as regular staff.' });
      return;
    }
    if (adminRegistry.some(a => a.email.toLowerCase() === normalizedEmail)) {
      toast({ variant: 'destructive', title: 'Duplicate Entry', description: `${normalizedEmail} is already registered.` });
      return;
    }

    setIsCreating(true);
    try {
      const result = await callManageAdmin({
        action: 'create',
        email: normalizedEmail,
        canAccessSettings: newAdminCanAccessSettings,
      });
      logAction("REGISTRY_ADD", `Authorized new staff: ${normalizedEmail}`);
      toast({
        title: 'Admin Created',
        description: result.data.passwordResetLink
          ? `Send this reset link to ${normalizedEmail}: ${result.data.passwordResetLink}`
          : `${normalizedEmail} created. Generate a reset link via "Reset Password".`,
      });
      setNewAdminEmail('');
      setNewAdminCanAccessSettings(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Create Failed', description: error.message });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAdmin = async (admin: AdminProfile) => {
    if (!confirm(`Revoke access for ${admin.email}? They will be signed out immediately.`)) return;
    setPendingActionUid(admin.uid);
    try {
      await callManageAdmin({ action: 'delete', uid: admin.uid });
      logAction("REGISTRY_REMOVE", `Revoked access for staff: ${admin.email}`);
      toast({ title: 'Success', description: 'Admin access revoked.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Delete Failed', description: error.message });
    } finally {
      setPendingActionUid(null);
    }
  };

  const handleToggleSettingsAccess = async (admin: AdminProfile, checked: boolean) => {
    setPendingActionUid(admin.uid);
    try {
      await callManageAdmin({ action: 'toggleSettings', uid: admin.uid, canAccessSettings: checked });
      logAction("PRIVILEGE_CHANGE", `${checked ? 'Elevated' : 'Demoted'} staff: ${admin.email} (Settings Access)`);
      toast({ title: 'Elevation Updated', description: `Settings access ${checked ? 'granted to' : 'revoked from'} ${admin.email}.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Elevation Failed', description: error.message });
    } finally {
      setPendingActionUid(null);
    }
  };

  const handleRotatePassword = async (admin: AdminProfile) => {
    setPendingActionUid(admin.uid);
    try {
      const result = await callManageAdmin({ action: 'rotatePassword', uid: admin.uid });
      toast({
        title: 'Password Reset Issued',
        description: result.data.passwordResetLink
          ? `Send this link to ${admin.email}: ${result.data.passwordResetLink}`
          : `Reset issued. Configure email to send automatically.`,
        duration: 12000,
      });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Reset Failed', description: error.message });
    } finally {
      setPendingActionUid(null);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black font-headline tracking-tighter italic uppercase">Admin <span className="text-accent">Configuration</span></h1>
        <p className="text-muted-foreground font-medium">Manage root authority and staff credentials directly.</p>
      </div>

      <Card className="glass-card border-accent/20 bg-accent/5 overflow-hidden">
        <CardHeader className="bg-accent/10 border-b border-accent/10">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-accent" />
            <div>
              <CardTitle className="text-lg font-black uppercase italic tracking-tight">System Administrator</CardTitle>
              <CardDescription className="text-xs">Update root authority credentials (Firebase Auth).</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase opacity-70">Primary Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                <Input value={selfEmail || ''} onChange={(e) => setSelfEmail(e.target.value)} className="glass-card pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase opacity-70">Secure Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                <Input
                  type="password"
                  placeholder="New password (leave blank to keep current)"
                  value={selfPassword || ''}
                  onChange={(e) => setSelfPassword(e.target.value)}
                  className="glass-card pl-10"
                />
              </div>
            </div>
          </div>
          <Button onClick={handleUpdateSelf} disabled={isUpdatingSelf} className="bg-accent hover:bg-accent/90 shadow-lg">
            {isUpdatingSelf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Update System Admin Profile
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-card border-white/5 h-fit lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-accent" /> Register Staff
            </CardTitle>
            <CardDescription className="text-xs">Create a new regular admin account. They will receive a password-reset link.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase opacity-70">Email Address</Label>
              <Input
                placeholder="colleague@example.com"
                value={newAdminEmail || ''}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="glass-card"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="space-y-0.5">
                <Label htmlFor="new-admin-settings" className="text-xs font-bold uppercase opacity-70">Settings Access</Label>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Allow season & data controls</p>
              </div>
              <Switch
                id="new-admin-settings"
                checked={newAdminCanAccessSettings}
                onCheckedChange={setNewAdminCanAccessSettings}
                className="data-[state=checked]:bg-accent"
              />
            </div>
            <Button onClick={handleAddAdmin} disabled={isCreating || !newAdminEmail} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white">
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authorize Identity"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 lg:col-span-2 overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5">
            <CardTitle className="text-lg font-bold">Admin Registry</CardTitle>
            <CardDescription className="text-xs">Manage active staff credentials and access elevations.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {registryLoading ? (
              <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-full opacity-10" />
                <Skeleton className="h-12 w-full opacity-10" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5">
                    <TableHead className="px-8 h-12 text-xs font-black uppercase tracking-widest text-muted-foreground">Staff Identity</TableHead>
                    <TableHead className="px-4 h-12 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Elevation</TableHead>
                    <TableHead className="px-8 h-12 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminRegistry.length > 0 ? adminRegistry.map((admin) => {
                    const isSelf = admin.uid === user?.id;
                    const isPending = pendingActionUid === admin.uid;
                    return (
                      <TableRow key={admin.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                        <TableCell className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                              <span className="text-accent text-[10px] font-black">{admin.email[0].toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="font-bold text-sm">{admin.email}</p>
                              {isSelf && (
                                <p className="text-[10px] uppercase font-black tracking-widest text-accent">You</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Switch
                              checked={admin.canAccessSettings || false}
                              disabled={isSelf || isPending}
                              onCheckedChange={(checked) => handleToggleSettingsAccess(admin, checked)}
                              className="scale-75 data-[state=checked]:bg-accent"
                            />
                            <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">Settings Access</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isPending}
                              onClick={() => handleRotatePassword(admin)}
                              title="Issue password reset link"
                              className="hover:bg-white/10"
                            >
                              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isSelf || isPending}
                              onClick={() => handleDeleteAdmin(admin)}
                              title="Revoke access"
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-32 text-center text-muted-foreground italic text-sm">
                        No staff currently registered.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
