-- Debug Query: Check All Listings and Their Display Status
-- Run this in Supabase SQL Editor to debug missing listing issue

-- 1. Check all listings with their status
SELECT 
  id,
  title,
  seller_id,
  status,
  category,
  condition,
  size,
  price,
  images,
  created_at
FROM listings
ORDER BY created_at DESC;

-- 2. Check active listings with seller profiles
SELECT 
  l.id as listing_id,
  l.title,
  l.status,
  l.category,
  l.condition,
  l.size,
  l.price,
  l.seller_id,
  p.username,
  p.user_id,
  CASE 
    WHEN p.user_id IS NULL THEN '❌ NO PROFILE'
    ELSE '✅ HAS PROFILE'
  END as profile_status
FROM listings l
LEFT JOIN profiles p ON l.seller_id = p.user_id
WHERE l.status = 'active'
ORDER BY l.created_at DESC;

-- 3. Count listings by status
SELECT 
  status,
  COUNT(*) as count
FROM listings
GROUP BY status;

-- 4. Check for listings without profiles
SELECT 
  l.id,
  l.title,
  l.seller_id,
  'Missing profile' as issue
FROM listings l
LEFT JOIN profiles p ON l.seller_id = p.user_id
WHERE l.status = 'active' AND p.user_id IS NULL;

-- 5. Check for listings with invalid data
SELECT 
  id,
  title,
  CASE 
    WHEN images IS NULL OR images = '[]' THEN '❌ No images'
    WHEN price IS NULL THEN '❌ No price'
    WHEN category IS NULL THEN '❌ No category'
    WHEN condition IS NULL THEN '❌ No condition'
    WHEN size IS NULL THEN '❌ No size'
    ELSE '✅ All fields OK'
  END as data_status
FROM listings
WHERE status = 'active';
