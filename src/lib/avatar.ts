/**
 * Get avatar URL for a user
 * Returns custom avatar if available, otherwise generates a consistent default avatar
 */
export const getAvatarUrl = (avatarUrl: string | null | undefined, userId: string): string => {
  if (avatarUrl) {
    return avatarUrl;
  }
  // Use consistent seed based on user_id for default avatars
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
};
