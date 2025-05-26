import { Router } from 'express';
import { 
    register, 
    login, 
    auth, 
    changePassword, 
    getAllUsers, 
    deleteUser 
} from '../controllers/user.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

const userRouter = Router();

// Rutas públicas
userRouter.post('/register', register);
userRouter.post('/login', login);

// Rutas protegidas
userRouter.get('/auth',authenticate ,auth);
userRouter.put('/change-password/:id', changePassword);
userRouter.get('/users/all', authenticate, authorizeRoles('ADMIN') , getAllUsers);
userRouter.delete('/:id', deleteUser);

export default userRouter;