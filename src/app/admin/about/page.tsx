'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, ArrowLeft, Users, Link as LinkIcon, X, Upload, Info } from 'lucide-react';
import Link from 'next/link';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAbout } from '@/hooks/use-about';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { AccessDenied } from '@/components/admin/access-denied';
import { uploadAboutPhoto, deleteAboutPhoto } from '@/firebase/storage';
import { detectPlatform, detectPlatformName } from '@/lib/social-utils';
import type { AboutPosition, TeamMember, SocialLink } from '@/types';

// --- Schemas ---
const positionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  order: z.coerce.number().min(1, 'Order is required'),
});

const memberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  positionId: z.string().min(1, 'Position is required'),
  description: z.string().max(350, 'Description too long (max ~50 words)').optional().default(''),
});

// --- Position Form ---
function PositionForm({ onSubmit, position, onCancel }: {
  onSubmit: (data: z.infer<typeof positionSchema>) => void;
  position?: AboutPosition;
  onCancel: () => void;
}) {
  const form = useForm<z.infer<typeof positionSchema>>({
    resolver: zodResolver(positionSchema),
    defaultValues: { title: position?.title || '', order: position?.order || 1 },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Position Title</FormLabel>
            <FormControl><Input placeholder="e.g. Operations Head" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="order" render={({ field }) => (
          <FormItem>
            <FormLabel>Display Order</FormLabel>
            <FormControl><Input type="number" min={1} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{position ? 'Update' : 'Add'} Position</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// --- Member Form ---
function MemberForm({ onSubmit, member, positions, onCancel }: {
  onSubmit: (data: z.infer<typeof memberSchema>, photoFile: File | null, socialLinks: SocialLink[]) => void;
  member?: TeamMember;
  positions: AboutPosition[];
  onCancel: () => void;
}) {
  const form = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: member?.name || '',
      positionId: member?.positionId || '',
      description: member?.description || '',
    },
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(member?.photoUrl || '');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(member?.socialLinks || []);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = (form.watch('description') || '').trim().split(/\s+/).filter(Boolean).length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB');
      return;
    }
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      alert('Only JPG, JPEG, and PNG files are allowed');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const addSocialLink = () => {
    if (!newLinkUrl.trim()) return;
    if (socialLinks.length >= 3) return;
    const platform = detectPlatformName(newLinkUrl.trim());
    setSocialLinks([...socialLinks, { url: newLinkUrl.trim(), platform }]);
    setNewLinkUrl('');
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSubmit(data, photoFile, socialLinks))} className="space-y-5">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="positionId" render={({ field }) => (
          <FormItem>
            <FormLabel>Position</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select a position" /></SelectTrigger></FormControl>
              <SelectContent>
                {positions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {/* Photo upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Photo</label>
          <div className="flex items-center gap-4">
            {photoPreview ? (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                <Image src={photoPreview} alt="Preview" fill className="object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg bg-secondary/20 border border-white/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}
            <div>
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" /> Choose Photo
              </Button>
              <p className="text-xs text-muted-foreground mt-1">JPG, JPEG, or PNG. Max 10MB.</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" className="hidden" onChange={handleFileChange} />
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="A short bio (max 50 words)" className="resize-none" rows={3} {...field} />
            </FormControl>
            <div className="flex justify-between">
              <FormMessage />
              <span className={`text-xs ${wordCount > 50 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {wordCount}/50 words
              </span>
            </div>
          </FormItem>
        )} />

        {/* Social Links */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Social Links (max 3)</label>
          {socialLinks.map((link, i) => {
            const { icon: Icon, label } = detectPlatform(link.url);
            return (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20 border border-white/10 min-w-0">
                <Icon className="h-4 w-4 text-accent shrink-0" />
                <span className="text-sm text-muted-foreground break-all flex-1 min-w-0">{link.url}</span>
                <span className="text-xs text-accent font-bold uppercase shrink-0">{label}</span>
                <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0" onClick={() => removeSocialLink(i)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
          {socialLinks.length < 3 && (
            <div className="flex gap-2 min-w-0">
              <Input
                placeholder="Paste a link (e.g. https://github.com/username)"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSocialLink(); } }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{member ? 'Update' : 'Add'} Member</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// --- Main Admin Page ---
export default function AdminAboutPage() {
  const { positions, members, loading, addPosition, updatePosition, deletePosition, addMember, updateMember, deleteMember, seedDefaultPositions } = useAbout();
  const { isSystemAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [posDialogOpen, setPosDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<AboutPosition | undefined>();
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Removed useEffect redirect to allow rendering of AccessDenied component

  if (authLoading || loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!isSystemAdmin) return <AccessDenied />;

  // --- Position handlers ---
  const handleAddPosition = async (data: z.infer<typeof positionSchema>) => {
    setIsSubmitting(true);
    try {
      const id = `pos-${Date.now()}`;
      await addPosition({ id, ...data });
      toast({ title: 'Position Added', description: `"${data.title}" has been created.` });
      setPosDialogOpen(false);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add position.' });
    }
    setIsSubmitting(false);
  };

  const handleUpdatePosition = async (data: z.infer<typeof positionSchema>) => {
    if (!editingPosition) return;
    setIsSubmitting(true);
    try {
      await updatePosition({ ...editingPosition, ...data });
      toast({ title: 'Position Updated', description: `"${data.title}" has been updated.` });
      setPosDialogOpen(false);
      setEditingPosition(undefined);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update position.' });
    }
    setIsSubmitting(false);
  };

  const handleDeletePosition = async (posId: string) => {
    try {
      await deletePosition(posId);
      toast({ title: 'Position Deleted', description: 'Position and its members have been removed.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete position.' });
    }
  };

  // --- Member handlers ---
  const handleAddMember = async (data: z.infer<typeof memberSchema>, photoFile: File | null, socialLinks: SocialLink[]) => {
    setIsSubmitting(true);
    try {
      let photoUrl = '';
      if (photoFile) {
        photoUrl = await uploadAboutPhoto(photoFile);
      }
      const id = `mbr-${Date.now()}`;
      const memberCount = members.filter((m: TeamMember) => m.positionId === data.positionId).length;
      await addMember({
        id,
        name: data.name,
        positionId: data.positionId,
        photoUrl,
        description: data.description || '',
        socialLinks,
        order: memberCount + 1,
      });
      toast({ title: 'Member Added', description: `${data.name} has been added.` });
      setMemberDialogOpen(false);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add member.' });
    }
    setIsSubmitting(false);
  };

  const handleUpdateMember = async (data: z.infer<typeof memberSchema>, photoFile: File | null, socialLinks: SocialLink[]) => {
    if (!editingMember) return;
    setIsSubmitting(true);
    try {
      let photoUrl = editingMember.photoUrl;
      if (photoFile) {
        // Delete old photo if it exists
        if (editingMember.photoUrl) {
          await deleteAboutPhoto(editingMember.photoUrl);
        }
        photoUrl = await uploadAboutPhoto(photoFile);
      }
      await updateMember({
        ...editingMember,
        name: data.name,
        positionId: data.positionId,
        photoUrl,
        description: data.description || '',
        socialLinks,
      });
      toast({ title: 'Member Updated', description: `${data.name} has been updated.` });
      setMemberDialogOpen(false);
      setEditingMember(undefined);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update member.' });
    }
    setIsSubmitting(false);
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      const member = members.find((m: TeamMember) => m.id === memberId);
      if (member?.photoUrl) {
        await deleteAboutPhoto(member.photoUrl);
      }
      await deleteMember(memberId);
      toast({ title: 'Member Removed', description: 'Team member has been removed.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete member.' });
    }
  };

  const handleSeedPositions = async () => {
    try {
      await seedDefaultPositions();
      toast({ title: 'Positions Seeded', description: 'Default positions have been created.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to seed positions.' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight">About Us Management</h1>
            <p className="text-sm text-muted-foreground">Manage team positions and members visible on the public About page.</p>
          </div>
        </div>
      </div>

      {/* Positions Section */}
      <Card className="border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Positions / Roles</CardTitle>
          <div className="flex gap-2">
            {positions.length === 0 && (
              <Button variant="outline" size="sm" onClick={handleSeedPositions}>
                <Info className="h-4 w-4 mr-2" /> Seed Defaults
              </Button>
            )}
            <Button size="sm" onClick={() => { setEditingPosition(undefined); setPosDialogOpen(true); }}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Position
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No positions yet. Click &quot;Seed Defaults&quot; to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-24 text-center">Members</TableHead>
                  <TableHead className="w-32 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((pos: AboutPosition) => (
                  <TableRow key={pos.id}>
                    <TableCell className="font-mono text-muted-foreground">{pos.order}</TableCell>
                    <TableCell className="font-bold">{pos.title}</TableCell>
                    <TableCell className="text-center">{members.filter((m: TeamMember) => m.positionId === pos.id).length}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingPosition(pos); setPosDialogOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete &quot;{pos.title}&quot;?</AlertDialogTitle>
                            <AlertDialogDescription>This will also delete all members assigned to this position. This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePosition(pos.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card className="border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Team Members</CardTitle>
          <Button size="sm" onClick={() => { setEditingMember(undefined); setMemberDialogOpen(true); }} disabled={positions.length === 0}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Member
          </Button>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No members yet. Add positions first, then add members.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="w-20">Links</TableHead>
                  <TableHead className="w-32 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member: TeamMember) => {
                  const pos = positions.find((p: AboutPosition) => p.id === member.positionId);
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary/20 border border-white/10">
                          {member.photoUrl ? (
                            <Image src={member.photoUrl} alt={member.name} width={40} height={40} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">{member.name}</TableCell>
                      <TableCell className="text-muted-foreground">{pos?.title || 'Unknown'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {member.socialLinks?.map((link: SocialLink, i: number) => {
                            const { icon: Icon } = detectPlatform(link.url);
                            return <Icon key={i} className="h-4 w-4 text-muted-foreground" />;
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingMember(member); setMemberDialogOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove {member.name}?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete this member and their photo. This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteMember(member.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Position Dialog */}
      <Dialog open={posDialogOpen} onOpenChange={(open) => { setPosDialogOpen(open); if (!open) setEditingPosition(undefined); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPosition ? 'Edit Position' : 'Add New Position'}</DialogTitle>
            <DialogDescription>
              {editingPosition ? 'Update the position details below.' : 'Create a new position/role for the About Us page.'}
            </DialogDescription>
          </DialogHeader>
          <PositionForm
            position={editingPosition}
            onSubmit={editingPosition ? handleUpdatePosition : handleAddPosition}
            onCancel={() => { setPosDialogOpen(false); setEditingPosition(undefined); }}
          />
        </DialogContent>
      </Dialog>

      {/* Member Dialog */}
      <Dialog open={memberDialogOpen} onOpenChange={(open) => { setMemberDialogOpen(open); if (!open) setEditingMember(undefined); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
            <DialogDescription>
              {editingMember ? 'Update member details, photo, and social links.' : 'Add a new team member with their photo and social links.'}
            </DialogDescription>
          </DialogHeader>
          <MemberForm
            key={editingMember?.id || 'new'}
            member={editingMember}
            positions={positions}
            onSubmit={editingMember ? handleUpdateMember : handleAddMember}
            onCancel={() => { setMemberDialogOpen(false); setEditingMember(undefined); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
