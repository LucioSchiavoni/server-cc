import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware para validar el formato de login
export const validateLoginRequest = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ 
            message: 'Se requieren email y contraseña' 
        });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ 
            message: 'Email y contraseña deben ser texto' 
        });
    }

    if (password.length < 6) {
        return res.status(400).json({ 
            message: 'La contraseña debe tener al menos 6 caracteres' 
        });
    }

    // Validación básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            message: 'Formato de email inválido' 
        });
    }

    next();
};

export function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded; // Guardamos el usuario en la request
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido' });
    }
}

// Middleware para roles
export function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ message: 'No tienes permisos para acceder a este recurso' });
        }
        next();
    };
}

export const checkSubscriptionStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { club: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (!user.active) {
            return res.status(403).json({ 
                message: 'Tu cuenta está desactivada. Por favor, contacta con soporte para reactivar tu suscripción.' 
            });
        }

        if (user.clubId && user.club) {
            if (!user.club.active) {
                return res.status(403).json({ 
                    message: 'El club al que perteneces está desactivado. Por favor, contacta con el administrador del club.' 
                });
            }
        }

        next();
    } catch (error) {
        console.error('Error al verificar estado de suscripción:', error);
        return res.status(500).json({ message: 'Error al verificar el estado de suscripción' });
    }
}