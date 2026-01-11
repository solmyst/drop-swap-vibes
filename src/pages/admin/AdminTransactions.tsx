import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle, XCircle, Clock, Eye, Search, Database } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PassWithPayment {
  id: string;
  user_id: string;
  pass_type: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  payment_id: string | null;
  created_at: string;
  profiles?: {
    full_name?: string;
    username?: string;
  };
}

const AdminTransactions = () => {
  const { isAdmin } = useAdmin();
  const [passes, setPasses] = useState<PassWithPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchPassesWithPayments();
    }
  }, [isAdmin]);

  const fetchPassesWithPayments = async () => {
    try {
      // First, let's try to fetch UPI transactions if the table exists
      const { data: upiTransactions, error: upiError } = await supabase
        .from('upi_transactions')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (!upiError && upiTransactions) {
        // UPI transactions table exists, use it
        setPasses(upiTransactions.map(tx => ({
          id: tx.id,
          user_id: tx.user_id,
          pass_type: tx.pass_type,
          starts_at: tx.created_at,
          expires_at: '', // UPI transactions don't have expiry
          is_active: tx.status === 'verified',
          payment_id: tx.transaction_id,
          created_at: tx.created_at,
          profiles: tx.profiles
        })));
        return;
      }

      // Fallback to user_passes with payment_id
      const { data, error } = await supabase
        .from('user_passes')
        .select('*')
        .not('payment_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = [...new Set(data?.map(pass => pass.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, username')
        .in('user_id', userIds);

      const passesWithProfiles = (data || []).map(pass => ({
        ...pass,
        profiles: profiles?.find(p => p.user_id === pass.user_id)
      }));

      setPasses(passesWithProfiles);
    } catch (error) {
      console.error('Error fetching passes:', error);
      toast.error('Failed to fetch transaction data');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">UPI Transactions</h1>
          <p className="text-muted-foreground">View pass purchases with UPI transaction IDs</p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">UPI Transaction Tracking</p>
              <p className="text-sm text-blue-700">
                {passes.length > 0 
                  ? `Showing ${passes.length} transactions. UPI transactions table is working!`
                  : "No transactions found. Users need to make UPI payments to see data here."
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passes with Payment IDs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pass Purchases with UPI Transaction IDs ({passes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : passes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No UPI transactions found
            </div>
          ) : (
            <div className="space-y-4">
              {passes.map((pass) => (
                <motion.div
                  key={pass.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">
                          {pass.payment_id}
                        </span>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Active
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {pass.profiles?.full_name || pass.profiles?.username || 'Unknown User'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{pass.pass_type.replace('_', ' ').toUpperCase()}</div>
                      <div className="text-sm text-muted-foreground">
                        {pass.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(pass.created_at).toLocaleString()}
                      {pass.expires_at && (
                        <span className="ml-2">
                          • Expires: {new Date(pass.expires_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTransactions;