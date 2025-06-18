import { Router } from 'express';
import { 
    register, 
    login, 
    auth, 
    changePassword, 
    getAllUsers, 
    deleteUser, 
    getAllSocio
} from '../controllers/user.controller.js';
import { authenticate, authorizeRoles, validateLoginRequest } from '../middlewares/auth.middleware.js';

const userRouter = Router();

// Rutas públicas
userRouter.post('/login', validateLoginRequest, login);

// Rutas protegidas
userRouter.post('/register', authenticate, authorizeRoles('ADMIN', 'CLUB'), register);
userRouter.get('/auth', authenticate, auth);
userRouter.get('/users/all', authenticate, authorizeRoles('ADMIN'), getAllUsers);
userRouter.get('/socios/:clubId', authenticate, authorizeRoles('CLUB'), getAllSocio);

export default userRouter;