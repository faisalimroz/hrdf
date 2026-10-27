import { verifyToken, isAdmin } from './authMiddleware.js';

/**
 * Combined Middleware: Require Authenticated Administrator
 */
export const requireAdmin = [verifyToken, isAdmin];

export { verifyToken, isAdmin };

export default requireAdmin;
