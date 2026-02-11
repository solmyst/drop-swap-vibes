import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, Shield, ShieldOff, Eye, ChevronLeft, ChevronRight,
  UserCog, Calendar, Trash2, Ban, UserCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type PassType = Database['public']['Enums']['pass_type'];

interface User {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  is_blocked: boolean | null;
  created_at: string;
  role?: string;
  activePass?: PassType | null;
  listingsCount?: number;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("user");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    
    const { data: profiles, count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (error) {
      toast.error('Failed to fetch users');
      return;
    }

    // Fetch roles for these users
    const userIds = profiles?.map(p => p.user_id) || [];
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds);

    // Fetch active passes
    const { data: passes } = await supabase
      .from('user_passes')
      .select('user_id, pass_type')
      .in('user_id', userIds)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString());

    // Fetch listing counts
    const { data: listings } = await supabase
      .from('listings')
      .select('seller_id')
      .in('seller_id', userIds);

    const listingCounts = new Map<string, number>();
    listings?.forEach(l => {
      listingCounts.set(l.seller_id, (listingCounts.get(l.seller_id) || 0) + 1);
    });

    const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
    const passMap = new Map(passes?.map(p => [p.user_id, p.pass_type]) || []);

    const enrichedUsers = (profiles || []).map(profile => ({
      ...profile,
      role: roleMap.get(profile.user_id) || 'user',
      activePass: passMap.get(profile.user_id) || null,
      listingsCount: listingCounts.get(profile.user_id) || 0,
    }));

    setUsers(enrichedUsers);
    setTotalCount(count || 0);
    setLoading(false);
  };

  const handleToggleAdmin = async (user: User) => {
    const isCurrentlyAdmin = user.role === 'admin';

    if (isCurrentlyAdmin) {
      // Remove admin role
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.user_id)
        .eq('role', 'admin');

      if (error) {
        toast.error('Failed to remove admin role');
        return;
      }
      toast.success('Admin role removed');
    } else {
      // Add admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: user.user_id, role: 'admin' });

      if (error) {
        toast.error('Failed to add admin role');
        return;
      }
      toast.success('Admin role granted');
    }

    fetchUsers();
  };

  const handleToggleVerified = async (user: User) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: !user.is_verified })
      .eq('user_id', user.user_id);

    if (error) {
      toast.error('Failed to update verification status');
      return;
    }

    toast.success(user.is_verified ? 'Verification removed' : 'User verified');
    fetchUsers();
  };

  const handleToggleBlock = async (user: User) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_blocked: !user.is_blocked })
      .eq('user_id', user.user_id);

    if (error) {
      toast.error('Failed to update block status');
      return;
    }

    toast.success(user.is_blocked ? 'User unblocked' : 'User blocked');
    fetchUsers();
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;

    // Remove existing role
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', selectedUser.user_id);

    // Add new role if not 'user'
    if (selectedRole !== 'user') {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: selectedUser.user_id, role: selectedRole });

      if (error) {
        toast.error('Failed to change role');
        return;
      }
    }

    toast.success(`Role changed to ${selectedRole}`);
    setShowRoleDialog(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    const { error } = await supabase.rpc('delete_user_and_data', {
      _user_id: selectedUser.user_id
    });

    if (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete user');
      return;
    }

    toast.success('User deleted successfully');
    setShowDeleteDialog(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / perPage);

  const getPassBadgeColor = (pass: PassType | null) => {
    if (!pass || pass === 'free') return 'secondary';
    if (pass.includes('pro')) return 'default';
    if (pass.includes('basic')) return 'outline';
    return 'secondary';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-display text-2xl font-bold mb-2">Manage Users</h1>
        <p className="text-muted-foreground">View and manage user accounts</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.slice(0, 100))}
          className="pl-10 bg-muted border-0"
          maxLength={100}
        />
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Pass</TableHead>
              <TableHead>Listings</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_id}`}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.username || 'Unnamed'}</span>
                          {user.is_verified && (
                            <Badge variant="secondary" className="text-xs">Verified</Badge>
                          )}
                          {user.is_blocked && (
                            <Badge variant="destructive" className="text-xs">Blocked</Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">{user.full_name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      user.role === 'admin' ? 'default' : 
                      user.role === 'moderator' ? 'secondary' : 
                      'outline'
                    }>
                      {user.role === 'admin' ? (
                        <><Shield className="w-3 h-3 mr-1" /> Admin</>
                      ) : user.role === 'moderator' ? (
                        <><UserCog className="w-3 h-3 mr-1" /> Moderator</>
                      ) : (
                        'User'
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPassBadgeColor(user.activePass)}>
                      {user.activePass?.replace('_', ' ') || 'Free'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.listingsCount}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedUser(user)}
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleBlock(user)}
                        title={user.is_blocked ? 'Unblock user' : 'Block user'}
                      >
                        {user.is_blocked ? (
                          <UserCheck className="w-4 h-4 text-green-500" />
                        ) : (
                          <Ban className="w-4 h-4 text-amber-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          setSelectedRole(user.role || 'user');
                          setShowRoleDialog(true);
                        }}
                        title="Change role"
                      >
                        <UserCog className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteDialog(true);
                        }}
                        title="Delete user"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser && !showDeleteDialog && !showRoleDialog} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.user_id}`}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-lg">{selectedUser.username || 'Unnamed'}</h3>
                  <p className="text-muted-foreground">{selectedUser.full_name}</p>
                  {selectedUser.is_blocked && (
                    <Badge variant="destructive" className="mt-1">Blocked</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Joined {new Date(selectedUser.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCog className="w-4 h-4 text-muted-foreground" />
                  <span>Role: {selectedUser.role}</span>
                </div>
              </div>

              <DialogFooter className="gap-2 flex-col sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => handleToggleVerified(selectedUser)}
                  className="w-full sm:w-auto"
                >
                  {selectedUser.is_verified ? 'Remove Verification' : 'Verify User'}
                </Button>
                <Button
                  variant={selectedUser.is_blocked ? 'default' : 'destructive'}
                  onClick={() => {
                    handleToggleBlock(selectedUser);
                    setSelectedUser(null);
                  }}
                  className="w-full sm:w-auto"
                >
                  {selectedUser.is_blocked ? 'Unblock User' : 'Block User'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Select a new role for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User (No special permissions)</SelectItem>
                <SelectItem value="moderator">Moderator (Can approve/reject listings)</SelectItem>
                <SelectItem value="admin">Admin (Full access)</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              {selectedRole === 'user' && 'Regular user with no admin privileges'}
              {selectedRole === 'moderator' && 'Can approve and reject listings, but cannot delete users or change roles'}
              {selectedRole === 'admin' && 'Full access to all admin features including user management'}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeRole}>
              Change Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.username}? This will permanently delete:
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>User account and profile</li>
            <li>All listings created by this user</li>
            <li>All messages sent by this user</li>
            <li>All conversations involving this user</li>
            <li>All reviews given and received</li>
            <li>Wishlist items</li>
          </ul>
          <p className="text-sm font-semibold text-destructive">
            This action cannot be undone!
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminUsers;
