import { Router } from 'express';

import { checkIfAdmin } from '../auth-middleware';
import { auth } from '../services';

export const router = Router();

/* Create a new user */
router.post('/api/auth/signup', auth.createUser);

/* Create a new admin */
router.post('/api/auth/makeadmin', checkIfAdmin, (req: any, res: any) =>
  auth.setUserAdmin(req, res, true),
);

/* Remove an admin */
router.post('/api/auth/removeadmin', checkIfAdmin, (req: any, res: any) =>
  auth.setUserAdmin(req, res, false),
);
