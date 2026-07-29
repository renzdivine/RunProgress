export const CLIENT_ID = '268005';
export const CLIENT_SECRET = 'b9c7102ea39e8cf0a92b412c2cce1ee2a437dcd3';
// Use env var if set, otherwise fallback to localhost:5173
export const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:5173/api/auth/callback';
