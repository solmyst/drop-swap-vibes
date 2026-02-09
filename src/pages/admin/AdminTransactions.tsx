import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, Database } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
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
      const { data, error } = await supabase
        .from('user_passes')
        .select('*')
        .not('payment_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

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

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">View pass purchases with payment IDs</p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-700">
              {passes.length > 0 ? `${passes.length} transactions found.` : "No transactions yet."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pass Purchases ({passes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : passes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No transactions found</div>
          ) : (
            <div className="space-y-4">
              {passes.map((pass) => (
                <motion.div key={pass.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">{pass.payment_id}</span>
                        <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {pass.profiles?.full_name || pass.profiles?.username || 'Unknown User'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{pass.pass_type.replace('_', ' ').toUpperCase()}</div>
                      <div className="text-sm text-muted-foreground">{pass.is_active ? 'Active' : 'Inactive'}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(pass.created_at).toLocaleString()}
                    {pass.expires_at && <span className="ml-2">• Expires: {new Date(pass.expires_at).toLocaleString()}</span>}
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
