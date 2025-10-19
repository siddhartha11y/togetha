// Utility function to get the correct image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/default-avatar.png';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // If it's a relative path, prepend the API base URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  return `${baseUrl}${imagePath}`;
};

export const getProfilePictureUrl = (profilePicture) => {
  if (!profilePicture || profilePicture === '/images/default-avatar.png') {
    return '/default-avatar.png';
  }
  return getImageUrl(profilePicture);
};