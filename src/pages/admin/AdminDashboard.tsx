import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, Users, Package, MessageCircle, Eye
} from "lucide-react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ASSETS } from "@/lib/assets";

const AdminDashboard = () => {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    activeListings: 0,
    totalMessages: 0,
  });

  useEffect(() => {
    console.log('🔐 Admin Dashboard - Auth state:', { isAdmin, loading });
    if (!loading && !isAdmin) {
      console.log('❌ Not admin, redirecting to home');
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchStats = async () => {
      // Fetch total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total listings
      const { count: listingsCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true });

      // Fetch active listings
      const { count: activeCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch total messages
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: usersCount || 0,
        totalListings: listingsCount || 0,
        activeListings: activeCount || 0,
        totalMessages: messagesCount || 0,
      });
    };

    fetchStats();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Overview', exact: true },
    { path: '/admin/listings', icon: Package, label: 'Listings' },
    { path: '/admin/users', icon: Users, label: 'Users' },
  ];

  const isOverview = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-background dark">
      {/* Admin Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <img 
                  src={ASSETS.logo} 
                  alt="रीवस्त्र Logo" 
                  className="w-10 h-10"
                />
              </div>
              <span className="font-display font-bold text-xl">
                <span className="text-gradient">रीवस्त्र</span>
                Admin <span className="text-gradient">Panel</span>
              </span>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm">Back to Site</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-border/50 glass p-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.path 
                : location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-6">
          {isOverview ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h1 className="font-display text-3xl font-bold mb-2">Dashboard Overview</h1>
                <p className="text-muted-foreground">Manage your marketplace</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Users
                    </CardTitle>
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Listings
                    </CardTitle>
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalListings}</div>
                  </CardContent>
                </Card>

                <Card className="glass border-primary/30">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-primary">
                      Active Listings
                    </CardTitle>
                    <Eye className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{stats.activeListings}</div>
                    <Link to="/admin/listings?filter=active">
                      <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                        View all →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Messages
                    </CardTitle>
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalMessages}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/admin/listings">
                  <Card className="glass hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Manage Listings</h3>
                        <p className="text-sm text-muted-foreground">
                          View all listings
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link to="/admin/users">
                  <Card className="glass hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Manage Users</h3>
                        <p className="text-sm text-muted-foreground">
                          View & manage accounts
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </motion.div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
