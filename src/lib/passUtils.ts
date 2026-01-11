import { PassType } from '@/components/PassCard';

// Define pass hierarchy for upgrade/downgrade logic
const passHierarchy: Record<PassType, number> = {
  'free': 0,
  'buyer_starter': 1,
  'buyer_basic': 2,
  'buyer_pro': 3,
  'seller_starter': 4,
  'seller_basic': 5,
  'seller_pro': 6,
};

// Check if a pass is an upgrade from current pass
export const isUpgrade = (currentPass: PassType, targetPass: PassType): boolean => {
  // Allow switching between buyer and seller categories
  if (currentPass.startsWith('buyer') && targetPass.startsWith('seller')) return true;
  if (currentPass.startsWith('seller') && targetPass.startsWith('buyer')) return true;
  
  // Within same category, check hierarchy
  return passHierarchy[targetPass] > passHierarchy[currentPass];
};

// Check if a pass is a downgrade from current pass
export const isDowngrade = (currentPass: PassType, targetPass: PassType): boolean => {
  // Don't allow downgrading to free if user has paid pass
  if (targetPass === 'free' && currentPass !== 'free') return true;
  
  // Within same category, check hierarchy
  if (currentPass.startsWith('buyer') && targetPass.startsWith('buyer')) {
    return passHierarchy[targetPass] < passHierarchy[currentPass];
  }
  if (currentPass.startsWith('seller') && targetPass.startsWith('seller')) {
    return passHierarchy[targetPass] < passHierarchy[currentPass];
  }
  
  return false;
};

// Get pass category
export const getPassCategory = (passType: PassType): 'free' | 'buyer' | 'seller' => {
  if (passType === 'free') return 'free';
  if (passType.startsWith('buyer')) return 'buyer';
  if (passType.startsWith('seller')) return 'seller';
  return 'free';
};

// Check if user can purchase a pass
export const canPurchasePass = (currentPass: PassType, targetPass: PassType): {
  canPurchase: boolean;
  reason?: string;
} => {
  if (currentPass === targetPass) {
    return { canPurchase: false, reason: 'You already have this pass' };
  }
  
  if (isDowngrade(currentPass, targetPass)) {
    return { canPurchase: false, reason: 'Cannot downgrade to a lower tier pass' };
  }
  
  return { canPurchase: true };
};