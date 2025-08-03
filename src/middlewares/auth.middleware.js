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

export const validateOrderData = (req, res, next) => {
    const { userId, date, total, items } = req.body;

    console.log('🔍 Validando datos de orden:', req.body);

    // Validar campos requeridos básicos
    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'El campo userId es requerido'
        });
    }

    if (!date) {
        return res.status(400).json({
            success: false,
            message: 'El campo date es requerido'
        });
    }

    if (!total) {
        return res.status(400).json({
            success: false,
            message: 'El campo total es requerido'
        });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El campo items es requerido y debe ser un array no vacío'
        });
    }

    // Validar que total sea un número válido
    if (isNaN(parseFloat(total)) || parseFloat(total) <= 0) {
        return res.status(400).json({
            success: false,
            message: 'El campo total debe ser un número válido mayor a 0'
        });
    }

    // Validar items básicamente
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.id) {
            return res.status(400).json({
                success: false,
                message: `El item ${i + 1} debe tener un id`
            });
        }
        if (!item.quantity || isNaN(parseFloat(item.quantity)) || parseFloat(item.quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: `El item ${i + 1} debe tener una quantity válida mayor a 0`
            });
        }
    }

    console.log('✅ Validación de datos de orden exitosa');
    next();
};