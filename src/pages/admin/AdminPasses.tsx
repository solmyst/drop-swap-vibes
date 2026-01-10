import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, Plus, ChevronLeft, ChevronRight, CreditCard, Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogFooter,
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

interface Pass {
  id: string;
  user_id: string;
  pass_type: PassType;
  is_active: boolean | null;
  starts_at: string;
  expires_at: string;
  created_at: string;
  profile?: { username: string | null };
}

interface Profile {
  user_id: string;
  username: string | null;
}

const passTypes: PassType[] = [
  'free', 'buyer_starter', 'buyer_basic', 'buyer_pro',
  'seller_starter', 'seller_basic', 'seller_pro'
];

const passPricing: Record<PassType, string> = {
  free: 'Free',
  buyer_starter: '₹49',
  buyer_basic: '₹99',
  buyer_pro: '₹199',
  seller_starter: '₹99',
  seller_basic: '₹199',
  seller_pro: '₹299',
};

const AdminPasses = () => {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPassType, setSelectedPassType] = useState<PassType>('buyer_starter');
  const [duration, setDuration] = useState("30");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 10;

  useEffect(() => {
    fetchPasses();
    fetchProfiles();
  }, [page]);

  const fetchPasses = async () => {
    setLoading(true);
    
    const { data, count, error } = await supabase
      .from('user_passes')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (error) {
      toast.error('Failed to fetch passes');
      return;
    }

    // Fetch profiles for pass holders
    const userIds = [...new Set(data?.map(p => p.user_id) || [])];
    const { data: passProfiles } = await supabase
      .from('profiles')
      .select('user_id, username')
      .in('user_id', userIds);

    const profileMap = new Map(passProfiles?.map(p => [p.user_id, p]) || []);

    const enrichedPasses = (data || []).map(pass => ({
      ...pass,
      profile: profileMap.get(pass.user_id),
    }));

    setPasses(enrichedPasses);
    setTotalCount(count || 0);
    setLoading(false);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('user_id, username')
      .order('username');
    
    setProfiles(data || []);
  };

  const handleAddPass = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(duration));

    const { error } = await supabase
      .from('user_passes')
      .insert({
        user_id: selectedUserId,
        pass_type: selectedPassType,
        starts_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true,
      });

    if (error) {
      toast.error('Failed to assign pass');
      return;
    }

    toast.success('Pass assigned successfully');
    setShowAddDialog(false);
    setSelectedUserId("");
    fetchPasses();
  };

  const handleDeactivatePass = async (pass: Pass) => {
    if (!confirm('Are you sure you want to deactivate this pass?')) return;

    const { error } = await supabase
      .from('user_passes')
      .update({ is_active: false })
      .eq('id', pass.id);

    if (error) {
      toast.error('Failed to deactivate pass');
      return;
    }

    toast.success('Pass deactivated');
    fetchPasses();
  };

  const filteredPasses = passes.filter(p =>
    p.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.pass_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / perPage);

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold mb-2">Manage Passes</h1>
          <p className="text-muted-foreground">View and assign user passes</p>
        </div>
        <Button variant="hero" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Assign Pass
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by user or pass type..."
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
              <TableHead>Pass Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
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
            ) : filteredPasses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No passes found
                </TableCell>
              </TableRow>
            ) : (
              filteredPasses.map((pass) => (
                <TableRow key={pass.id}>
                  <TableCell className="font-medium">
                    {pass.profile?.username || 'Unknown User'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      <CreditCard className="w-3 h-3 mr-1" />
                      {pass.pass_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{passPricing[pass.pass_type]}</TableCell>
                  <TableCell>
                    {!pass.is_active ? (
                      <Badge variant="secondary">Inactive</Badge>
                    ) : isExpired(pass.expires_at) ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : (
                      <Badge className="bg-green-500/20 text-green-500">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(pass.expires_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {pass.is_active && !isExpired(pass.expires_at) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeactivatePass(pass)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
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

      {/* Add Pass Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Pass to User</DialogTitle>
            <DialogDescription>
              Select a user and pass type to assign manually.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="bg-muted border-0">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map(profile => (
                    <SelectItem key={profile.user_id} value={profile.user_id}>
                      {profile.username || 'Unnamed User'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pass Type</Label>
              <Select value={selectedPassType} onValueChange={(v) => setSelectedPassType(v as PassType)}>
                <SelectTrigger className="bg-muted border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {passTypes.filter(t => t !== 'free').map(type => (
                    <SelectItem key={type} value={type}>
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                      <span className="text-muted-foreground ml-2">({passPricing[type]})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duration (days)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-muted border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={handleAddPass}>
              Assign Pass
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminPasses;
