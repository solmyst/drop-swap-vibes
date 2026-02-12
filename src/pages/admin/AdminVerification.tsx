import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, CheckCircle, XCircle, Clock, Mail, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getAvatarUrl } from "@/lib/avatar";

interface VerificationRequest {
  id: string;
  user_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user: {
    email: string;
    username: string;
    avatar_url: string | null;
    full_name: string;
  };
}

const AdminVerification = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);

    const { data: requestsData, error } = await supabase
      .from('verification_requests')
      .select(`
        id,
        user_id,
        reason,
        status,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load verification requests');
      setLoading(false);
      return;
    }

    // Fetch user details for each request
    const requestsWithUsers = await Promise.all(
      (requestsData || []).map(async (request) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url, full_name, email')
          .eq('user_id', request.user_id)
          .maybeSingle();

        return {
          ...request,
          user: {
            email: profile?.email || 'Unknown',
            username: profile?.username || 'Unknown',
            avatar_url: profile?.avatar_url || null,
            full_name: profile?.full_name || '',
          },
        };
      })
    );

    setRequests(requestsWithUsers);
    setLoading(false);
  };

  const handleApprove = async (requestId: string, userId: string) => {
    setProcessingId(requestId);

    // Update profile to verified
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('user_id', userId);

    if (profileError) {
      toast.error('Failed to verify user');
      setProcessingId(null);
      return;
    }

    // Update request status
    const { error: requestError } = await supabase
      .from('verification_requests')
      .update({ 
        status: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (requestError) {
      toast.error('Failed to update request');
      setProcessingId(null);
      return;
    }

    toast.success('User verified successfully!');
    setProcessingId(null);
    fetchRequests();
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);

    const { error } = await supabase
      .from('verification_requests')
      .update({ 
        status: 'rejected',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) {
      toast.error('Failed to reject request');
      setProcessingId(null);
      return;
    }

    toast.success('Request rejected');
    setProcessingId(null);
    fetchRequests();
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const reviewedRequests = requests.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Verification Requests</h2>
        <p className="text-muted-foreground">
          Review and approve user verification requests
        </p>
      </div>

      {/* Pending Requests */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-500" />
          Pending Requests ({pendingRequests.length})
        </h3>

        {pendingRequests.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-8 text-center text-muted-foreground">
              No pending verification requests
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={getAvatarUrl(request.user.avatar_url, request.user_id)}
                          alt={request.user.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <CardTitle className="text-base">
                            {request.user.full_name || request.user.username}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <User className="w-3 h-3" />
                            <span>@{request.user.username}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Mail className="w-3 h-3" />
                            <span>{request.user.email}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Reason for verification:</p>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {request.reason}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Requested {new Date(request.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(request.id, request.user_id)}
                        disabled={processingId === request.id}
                        className="flex-1 gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve & Verify
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(request.id)}
                        disabled={processingId === request.id}
                        className="flex-1 gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Reviewed Requests */}
      {reviewedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Reviewed Requests ({reviewedRequests.length})
          </h3>
          <div className="space-y-4">
            {reviewedRequests.map((request) => (
              <Card key={request.id} className="glass opacity-60">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={getAvatarUrl(request.user.avatar_url, request.user_id)}
                        alt={request.user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <CardTitle className="text-sm">
                          {request.user.full_name || request.user.username}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          @{request.user.username}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={request.status === 'approved' ? 'default' : 'destructive'}
                      className="gap-1"
                    >
                      {request.status === 'approved' ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerification;
