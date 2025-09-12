// Instagram-like time formatting utility
export const formatInstagramTime = (timestamp) => {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - postTime) / 1000);

  // Less than 60 seconds - show "now" or seconds
  if (diffInSeconds < 5) {
    return 'now';
  } else if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  }

  // Less than 60 minutes - show minutes
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  // Less than 24 hours - show hours
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  // Less than 7 days - show days
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }

  // Less than 4 weeks - show weeks
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w`;
  }

  // More than 4 weeks - show exact date like Instagram
  const options = { 
    month: 'long', 
    day: 'numeric'
  };
  
  // If it's from a different year, include the year
  if (postTime.getFullYear() !== now.getFullYear()) {
    options.year = 'numeric';
  }
  
  return postTime.toLocaleDateString('en-US', options);
};

// For comments - similar but with "ago" suffix for better readability
export const formatCommentTime = (timestamp) => {
  const now = new Date();
  const commentTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - commentTime) / 1000);

  // Less than 60 seconds
  if (diffInSeconds < 5) {
    return 'now';
  } else if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }

  // Less than 60 minutes
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  // Less than 24 hours
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  // Less than 7 days
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // Less than 4 weeks
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  // More than 4 weeks - show exact date
  const options = { 
    month: 'long', 
    day: 'numeric'
  };
  
  if (commentTime.getFullYear() !== now.getFullYear()) {
    options.year = 'numeric';
  }
  
  return commentTime.toLocaleDateString('en-US', options);
};













