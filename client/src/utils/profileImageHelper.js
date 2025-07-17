/**
 * Utility functions for handling profile images
 */

/**
 * Get a fallback profile image URL using UI Avatars service
 * @param {string} name - User's name to generate initials
 * @param {number} size - Size of the image in pixels
 * @returns {string} - URL for the fallback profile image
 */
export const getFallbackProfileImage = (name = 'User', size = 80) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=${size}`;
};

/**
 * Check if a profile image URL is from the deprecated avatar service
 * @param {string} url - Profile image URL to check
 * @returns {boolean} - True if the URL is from the deprecated service
 */
export const isDeprecatedAvatarUrl = (url) => {
  return url && url.includes('avatar.iran.liara.run');
};

/**
 * Get a valid profile image URL, replacing deprecated URLs with fallbacks
 * @param {Object} user - User object containing profilePic and fullname
 * @param {number} size - Size of the image in pixels
 * @returns {string} - Valid profile image URL
 */
export const getValidProfileImageUrl = (user, size = 80) => {
  if (!user) return getFallbackProfileImage('User', size);
  
  // If the user has a profile pic that's not from the deprecated service, use it
  if (user.profilePic && !isDeprecatedAvatarUrl(user.profilePic)) {
    return user.profilePic;
  }
  
  // Otherwise generate a fallback based on the user's name
  return getFallbackProfileImage(user.fullname || 'User', size);
};