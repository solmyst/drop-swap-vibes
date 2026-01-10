import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, XCircle, Eye, Trash2, Search, 
  Filter, ChevronLeft, ChevronRight, Image as ImageIcon
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  status: string;
  is_approved: boolean;
  images: string[];
  created_at: string;
  seller_id: string;
  seller?: { username: string };
}

const AdminListings = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState(searchParams.get('filter') || "all");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 10;

  useEffect(() => {
    fetchListings();
  }, [filterStatus, page]);

  const fetchListings = async () => {
    setLoading(true);
    
    let query = supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (filterStatus === 'pending') {
      query = query.eq('is_approved', false).eq('status', 'active');
    } else if (filterStatus === 'approved') {
      query = query.eq('is_approved', true);
    } else if (filterStatus === 'rejected') {
      query = query.eq('status', 'rejected');
    }

    const { data, count, error } = await query;

    if (error) {
      toast.error('Failed to fetch listings');
      return;
    }

    // Fetch seller profiles
    const sellerIds = [...new Set(data?.map(l => l.seller_id) || [])];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username')
      .in('user_id', sellerIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    const enrichedListings = (data || []).map(listing => ({
      ...listing,
      seller: profileMap.get(listing.seller_id),
    }));

    setListings(enrichedListings);
    setTotalCount(count || 0);
    setLoading(false);
  };

  const handleApprove = async (listing: Listing) => {
    const { error } = await supabase
      .from('listings')
      .update({
        is_approved: true,
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
        rejection_reason: null,
      })
      .eq('id', listing.id);

    if (error) {
      toast.error('Failed to approve listing');
      return;
    }

    toast.success('Listing approved!');
    fetchListings();
  };

  const handleReject = async () => {
    if (!selectedListing) return;

    const { error } = await supabase
      .from('listings')
      .update({
        is_approved: false,
        status: 'rejected',
        rejection_reason: rejectReason,
      })
      .eq('id', selectedListing.id);

    if (error) {
      toast.error('Failed to reject listing');
      return;
    }

    toast.success('Listing rejected');
    setShowRejectDialog(false);
    setSelectedListing(null);
    setRejectReason("");
    fetchListings();
  };

  const handleDelete = async (listing: Listing) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listing.id);

    if (error) {
      toast.error('Failed to delete listing');
      return;
    }

    toast.success('Listing deleted');
    fetchListings();
  };

  const filteredListings = listings.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.seller?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-display text-2xl font-bold mb-2">Manage Listings</h1>
        <p className="text-muted-foreground">Review, approve, and manage all listings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search listings or sellers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.slice(0, 100))}
            className="pl-10 bg-muted border-0"
            maxLength={100}
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
          <SelectTrigger className="w-[180px] bg-muted border-0">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Listings</SelectItem>
            <SelectItem value="pending">Pending Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredListings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No listings found
                </TableCell>
              </TableRow>
            ) : (
              filteredListings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    {listing.images?.[0] ? (
                      <img
                        src={listing.images[0]}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {listing.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {listing.seller?.username || 'Unknown'}
                  </TableCell>
                  <TableCell>₹{listing.price}</TableCell>
                  <TableCell>
                    {listing.status === 'rejected' ? (
                      <Badge variant="destructive">Rejected</Badge>
                    ) : listing.is_approved ? (
                      <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-amber-500/20 text-amber-500">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedListing(listing)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!listing.is_approved && listing.status !== 'rejected' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-500 hover:text-green-600"
                            onClick={() => handleApprove(listing)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => {
                              setSelectedListing(listing);
                              setShowRejectDialog(true);
                            }}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(listing)}
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

      {/* Preview Dialog */}
      <Dialog open={!!selectedListing && !showRejectDialog} onOpenChange={() => setSelectedListing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedListing?.title}</DialogTitle>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {selectedListing.images?.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className="w-full aspect-square rounded-lg object-cover"
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Category:</span>{' '}
                  <span className="capitalize">{selectedListing.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Condition:</span>{' '}
                  <span className="capitalize">{selectedListing.condition}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Price:</span>{' '}
                  <span className="font-bold">₹{selectedListing.price}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Seller:</span>{' '}
                  <span>{selectedListing.seller?.username || 'Unknown'}</span>
                </div>
              </div>
              {!selectedListing.is_approved && selectedListing.status !== 'rejected' && (
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="hero"
                    onClick={() => {
                      handleApprove(selectedListing);
                      setSelectedListing(null);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Listing
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Listing</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this listing. The seller will see this message.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminListings;
