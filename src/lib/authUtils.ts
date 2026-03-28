// Authentication utility functions

export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    // Clear all local storage data
    localStorage.clear();
  }
};

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  
  try {
    // Decode JWT token (without verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired (with 5 minute buffer)
    return payload.exp < (currentTime + 300);
  } catch (error) {
    return true;
  }
};

export const getTokenExpirationTime = (token: string | null): Date | null => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    return null;
  }
};

export const shouldRefreshToken = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Refresh token if it expires in the next 10 minutes
    return payload.exp < (currentTime + 600);
  } catch (error) {
    return false;
  }
};
