import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PassType } from '@/components/PassCard';

interface PassBenefits {
  chatLimit: number;
  listingLimit: number;
  hasUnlimitedChats: boolean;
  hasUnlimitedListings: boolean;
  hasSellerContactAccess: boolean;
  hasEarlyAccess: boolean;
  hasVerifiedBadge: boolean;
  hasPrioritySearch: boolean;
  currentPass: PassType;
}

interface UsageStats {
  chatsUsed: number;
  listingsUsed: number;
}

export const usePassBenefits = () => {
  const { user } = useAuth();
  const [benefits, setBenefits] = useState<PassBenefits>({
    chatLimit: 2,
    listingLimit: 3,
    hasUnlimitedChats: false,
    hasUnlimitedListings: false,
    hasSellerContactAccess: false,
    hasEarlyAccess: false,
    hasVerifiedBadge: false,
    hasPrioritySearch: false,
    currentPass: 'free',
  });
  const [usage, setUsage] = useState<UsageStats>({
    chatsUsed: 0,
    listingsUsed: 0,
  });
  const [loading, setLoading] = useState(true);

  const getPassBenefits = (passType: PassType): PassBenefits => {
    const baseBenefits = {
      currentPass: passType,
      hasSellerContactAccess: passType !== 'free',
      hasEarlyAccess: false,
      hasVerifiedBadge: false,
      hasPrioritySearch: false,
    };

    switch (passType) {
      case 'free':
        return {
          ...baseBenefits,
          chatLimit: 2,
          listingLimit: 3,
          hasUnlimitedChats: false,
          hasUnlimitedListings: false,
          hasSellerContactAccess: false,
        };
      
      case 'buyer_starter':
        return {
          ...baseBenefits,
          chatLimit: 2,
          listingLimit: 3,
          hasUnlimitedChats: false,
          hasUnlimitedListings: false,
        };
      
      case 'buyer_basic':
        return {
          ...baseBenefits,
          chatLimit: 8,
          listingLimit: 3,
          hasUnlimitedChats: false,
          hasUnlimitedListings: false,
        };
      
      case 'buyer_pro':
        return {
          ...baseBenefits,
          chatLimit: -1,
          listingLimit: 3,
          hasUnlimitedChats: true,
          hasUnlimitedListings: false,
          hasEarlyAccess: true,
        };
      
      case 'seller_starter':
        return {
          ...baseBenefits,
          chatLimit: -1,
          listingLimit: 10,
          hasUnlimitedChats: true,
          hasUnlimitedListings: false,
        };
      
      case 'seller_basic':
        return {
          ...baseBenefits,
          chatLimit: -1,
          listingLimit: 25,
          hasUnlimitedChats: true,
          hasUnlimitedListings: false,
          hasVerifiedBadge: true,
        };
      
      case 'seller_pro':
        return {
          ...baseBenefits,
          chatLimit: -1,
          listingLimit: -1,
          hasUnlimitedChats: true,
          hasUnlimitedListings: true,
          hasVerifiedBadge: true,
          hasPrioritySearch: true,
        };
      
      default:
        return {
          ...baseBenefits,
          chatLimit: 2,
          listingLimit: 3,
          hasUnlimitedChats: false,
          hasUnlimitedListings: false,
          hasSellerContactAccess: false,
        };
    }
  };

  const fetchUserPass = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching user pass for:', user.id);
      
      // Get active pass
      const { data: activePass, error: passError } = await supabase
        .from('user_passes')
        .select('pass_type')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .limit(1)
        .single();

      if (passError && passError.code !== 'PGRST116') {
        console.error('Error fetching pass:', passError);
      }

      const currentPassType = activePass?.pass_type || 'free';
      console.log('Current pass type:', currentPassType);
      setBenefits(getPassBenefits(currentPassType));

      // Get usage stats
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('total_chats_started, total_listings_created')
        .eq('user_id', user.id)
        .single();

      if (usageError && usageError.code !== 'PGRST116') {
        console.error('Error fetching usage:', usageError);
      }

      if (usageData) {
        setUsage({
          chatsUsed: usageData.total_chats_started || 0,
          listingsUsed: usageData.total_listings_created || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching pass benefits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPass();
  }, [user]);

  const canStartChat = () => {
    if (benefits.hasUnlimitedChats) return true;
    return usage.chatsUsed < benefits.chatLimit;
  };

  const canCreateListing = () => {
    if (benefits.hasUnlimitedListings) return true;
    return usage.listingsUsed < benefits.listingLimit;
  };

  const getRemainingChats = () => {
    if (benefits.hasUnlimitedChats) return -1;
    return Math.max(0, benefits.chatLimit - usage.chatsUsed);
  };

  const getRemainingListings = () => {
    if (benefits.hasUnlimitedListings) return -1;
    return Math.max(0, benefits.listingLimit - usage.listingsUsed);
  };

  const incrementChatUsage = async () => {
    if (!user) return;
    
    const newChatsUsed = usage.chatsUsed + 1;
    setUsage(prev => ({ ...prev, chatsUsed: newChatsUsed }));

    // Update in database
    await supabase
      .from('user_usage')
      .upsert({
        user_id: user.id,
        total_chats_started: newChatsUsed,
        total_listings_created: usage.listingsUsed,
      });
  };

  const incrementListingUsage = async () => {
    if (!user) return;
    
    const newListingsUsed = usage.listingsUsed + 1;
    setUsage(prev => ({ ...prev, listingsUsed: newListingsUsed }));

    // Update in database
    await supabase
      .from('user_usage')
      .upsert({
        user_id: user.id,
        total_chats_started: usage.chatsUsed,
        total_listings_created: newListingsUsed,
      });
  };

  return {
    benefits,
    usage,
    loading,
    canStartChat,
    canCreateListing,
    getRemainingChats,
    getRemainingListings,
    incrementChatUsage,
    incrementListingUsage,
    refreshBenefits: fetchUserPass,
  };
};