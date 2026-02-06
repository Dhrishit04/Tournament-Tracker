'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, ShieldAlert, Key, Mail, Trash2, Edit, Save, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { type AdminProfile } from '@/types';
import { doc, setDoc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { updateEmail, updatePassword, getAuth } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { AccessDenied } from '@/components/admin/access-denied';
import { useData } from '@/hooks/use-data';

export default function AdminConfigPage() {
  const { user, isSystemAdmin } = useAuth();
  const firestore = useFirestore();
  const { logAction } = useData();
  const { data: adminRegistry, loading: registryLoading } = useCollection<AdminProfile>('admins');
  const { toast } = useToast();
  
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [isUpdatingSelf, setIsUpdatingSelf] = useState(false);
  const [selfEmail, setSelfEmail] = useState('');
  const [selfPassword, setSelfPassword] = useState('');

  const [editingAdmin, setEditingAdmin] = useState<AdminProfile | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.email) {
      setSelfEmail(user.email);
    }
  }, [user?.email]);

  if (!isSystemAdmin) {
    return <AccessDenied />;
  }

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

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

  const handleAddAdminRegistry = async () => {
    if (!firestore || !newAdminEmail || !newAdminPassword) return;

    const normalizedEmail = newAdminEmail.toLowerCase().trim();

    if (normalizedEmail === user?.email?.toLowerCase()) {
      toast({ variant: 'destructive', title: 'Invalid Identity', description: 'Cannot add System Admin to regular registry.' });
      return;
    }

    const isDuplicate = adminRegistry.some(admin => admin.email.toLowerCase() === normalizedEmail);
    if (isDuplicate) {
      toast({ variant: 'destructive', title: 'Duplicate Entry', description: `${normalizedEmail} is already registered.` });
      return;
    }

    setIsCreating(true);
    const adminId = `admin-${Date.now()}`;
    const adminData = {
      email: normalizedEmail,
      password: newAdminPassword,
      createdAt: Date.now(),
      canAccessSettings: false,
    };
    const docRef = doc(firestore, 'admins', adminId);

    setDoc(docRef, adminData).then(() => {
      logAction("REGISTRY_ADD", `Authorized new staff: ${normalizedEmail}`);
      toast({ title: 'Admin Created', description: `${normalizedEmail} is now authorized.` });
      setNewAdminEmail('');
      setNewAdminPassword('');
    }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: adminData
      }));
    }).finally(() => {
      setIsCreating(false);
    });
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!firestore) return;
    const adminEmail = adminRegistry.find(a => a.id === id)?.email;
    const docRef = doc(firestore, 'admins', id);
    deleteDoc(docRef).then(() => {
      logAction("REGISTRY_REMOVE", `Revoked access for staff: ${adminEmail}`);
      toast({ title: 'Success', description: 'Admin access revoked.' });
    }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete'
      }));
    });
  };

  const handleToggleSettingsAccess = async (admin: AdminProfile, checked: boolean) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'admins', admin.id);
    const updateData = { canAccessSettings: checked };
    
    updateDoc(docRef, updateData).then(() => {
        logAction("PRIVILEGE_CHANGE", `${checked ? 'Elevated' : 'Demoted'} staff: ${admin.email} (Settings Access)`);
        toast({ title: 'Elevation Updated', description: `Settings access ${checked ? 'granted to' : 'revoked from'} ${admin.email}.` });
    }).catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: updateData
        }));
    });
  };

  const handleUpdateRegistryAdmin = async () => {
    if (!editingAdmin || !firestore) return;

    const normalizedEmail = (editingAdmin.email || '').toLowerCase().trim();

    if (normalizedEmail === user?.email?.toLowerCase()) {
      toast({ variant: 'destructive', title: 'Forbidden', description: 'Cannot assign System Admin email to a regular role.' });
      return;
    }

    const docRef = doc(firestore, 'admins', editingAdmin.id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const old = snap.data() as AdminProfile;

    const logs: string[] = [];
    if (old.email !== normalizedEmail) logs.push(`email: ${old.email} -> ${normalizedEmail}`);
    if (old.password !== editingAdmin.password) logs.push(`password updated`);

    const updateData = { 
      email: normalizedEmail,
      password: editingAdmin.password
    };

    updateDoc(docRef, updateData).then(() => {
      const details = logs.length > 0 ? `Modified Registry Identity for ${normalizedEmail} (${logs.join(', ')})` : `Modified credentials for staff: ${normalizedEmail}`;
      logAction("REGISTRY_EDIT", details);
      setEditingAdmin(null);
      toast({ title: 'Updated', description: 'Staff credentials modified successfully.' });
    }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: updateData
      }));
    });
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
            <CardDescription className="text-xs">Create a new regular admin account.</CardDescription>
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
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase opacity-70">Assigned Password</Label>
              <Input 
                type="text"
                placeholder="Initial password" 
                value={newAdminPassword || ''} 
                onChange={(e) => setNewAdminPassword(e.target.value)} 
                className="glass-card"
              />
            </div>
            <Button onClick={handleAddAdminRegistry} disabled={isCreating || !newAdminEmail || !newAdminPassword} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white">
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
                  {adminRegistry.length > 0 ? adminRegistry.map((admin) => (
                    <TableRow key={admin.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                            <span className="text-accent text-[10px] font-black">{admin.email[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-bold text-sm">{admin.email}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">PW:</span>
                                <span className="text-[10px] font-mono tracking-tighter opacity-60">
                                    {showPasswords[admin.id] ? admin.password : '••••••••'}
                                </span>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-4 w-4 opacity-40 hover:opacity-100" 
                                    onClick={() => togglePasswordVisibility(admin.id)}
                                >
                                    {showPasswords[admin.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </Button>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                            <Switch 
                                checked={admin.canAccessSettings || false} 
                                onCheckedChange={(checked) => handleToggleSettingsAccess(admin, checked)}
                                className="scale-75 data-[state=checked]:bg-accent"
                            />
                            <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">Settings Access</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => setEditingAdmin(admin)} className="hover:bg-white/10">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAdmin(admin.id)} className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
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

      <Dialog open={!!editingAdmin} onOpenChange={(open) => !open && setEditingAdmin(null)}>
        <DialogContent className="glass-card border-white/5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Modify <span className="text-accent">Identity</span></DialogTitle>
            <DialogDescription className="text-white/70">Update credentials for {editingAdmin?.email}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase opacity-70">Staff Email</Label>
              <Input 
                value={editingAdmin?.email || ''} 
                onChange={(e) => setEditingAdmin(prev => prev ? {...prev, email: e.target.value} : null)} 
                className="glass-card" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase opacity-70">Staff Password</Label>
              <Input 
                value={editingAdmin?.password || ''} 
                onChange={(e) => setEditingAdmin(prev => prev ? {...prev, password: e.target.value} : null)} 
                className="glass-card" 
              />
            </div>
          </div>
          <DialogFooter className="pt-6">
            <Button variant="ghost" onClick={() => setEditingAdmin(null)} className="hover:bg-white/5">Cancel</Button>
            <Button onClick={handleUpdateRegistryAdmin} className="bg-accent hover:bg-accent/90">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
