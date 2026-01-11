import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';

const DebugUser = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();
  
  if (!user) return <div>Not logged in</div>;
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'black', 
      color: 'white', 
      padding: '10px',
      zIndex: 9999,
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <div>User ID: {user.id}</div>
      <div>Email: {user.email}</div>
      <div>Admin Loading: {loading ? 'Yes' : 'No'}</div>
      <div>Is Admin: {isAdmin ? 'Yes' : 'No'}</div>
    </div>
  );
};

export default DebugUser;