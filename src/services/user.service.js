import prisma from '../config/db.js'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
dotenv.config()

// Clase personalizada para errores de la aplicación
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Función para manejar respuestas exitosas
const successResponse = (data, message, statusCode = 200) => {
    return {
        success: true,
        statusCode,
        message,
        data
    };
};

// Función para manejar respuestas de error
const errorResponse = (message, statusCode = 400) => {
    return {
        success: false,
        statusCode,
        message
    };
};

export const registerService = async (req) => {
    const {name, password, rol, email, address, phone, clubId} = req.body;
    
    try {
        const exist = await prisma.user.findFirst({
            where: { email }
        });


        if(exist) {
            throw new AppError('El usuario ya existe', 400);
        }

        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);
        
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashPassword,
                rol,
                address,
                phone,
                clubId: clubId || null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                rol: true,
                createdAt: true
            }
        });

        return successResponse(newUser, 'Usuario creado con éxito', 201);
        
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(error.message, error.statusCode);
        }
        return errorResponse('Error al registrar usuario', 500);
    }
};

export const loginService = async (req) => {
    const {email, password} = req.body;
    
    try {
        const existUser = await prisma.user.findUnique({
            where: { email }
        });

        if (!existUser) {
            throw new AppError('Usuario no encontrado', 404);
        }

        const passwordMatch = await bcrypt.compare(password, existUser.password);
        if (!passwordMatch) {
            throw new AppError('Credenciales inválidas', 401);
        }

        const token = jwt.sign({ 
            id: existUser.id,
            email: existUser.email,
            name: existUser.name,
            rol: existUser.rol,
            address: existUser.address,
            phone: existUser.phone,
            clubId: existUser.clubId,
            active: existUser.active
        }, process.env.SECRET_KEY, { expiresIn: '12h' });

        return successResponse(
            { 
                token,
                user: {
                    id: existUser.id,
                    email: existUser.email,
                    name: existUser.name,
                    rol: existUser.rol,
                    address: existUser.address,
                    phone: existUser.phone,
                    clubId: existUser.clubId,
                    active: existUser.active,
                }
            },
            'Login exitoso'
        );

    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(error.message, error.statusCode);
        }
        return errorResponse('Error en el proceso de login', 500);
    }
};

export const authService = async (req) => {
    try {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            throw new AppError('No se proporcionó token de autenticación', 401);
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

        const userToken = await prisma.user.findUnique({
            where: { id: decodedToken.id },
            select: {
                id: true,
                email: true,
                name: true,
                address:true,
                phone: true,
                rol: true,
                clubId: true,
                active: true,
            }
        });

        if(!userToken) {
            throw new AppError('Usuario no encontrado', 404);
        }

        return successResponse(userToken, 'Autenticación exitosa');

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return errorResponse('Token JWT inválido', 401);
        }
        if (error instanceof AppError) {
            return errorResponse(error.message, error.statusCode);
        }
        return errorResponse('Error en la autenticación', 500);
    }
};

export const changePasswordService = async(req) => {
    const {id} = req.params;
    const {password} = req.body;

    try {
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);
        
        await prisma.user.update({
            where: { id: parseInt(id) },
            data: { password: hashPassword }
        });

        return successResponse(null, 'Contraseña actualizada con éxito');

    } catch (error) {
        return errorResponse('Error al actualizar la contraseña', 500);
    }
};

export const getAllUserService = async() => {
    try {
        const users = await prisma.user.findMany({
            where:{
                rol:"CLUB"
            },
            select: {
                id: true,
                email: true,
                name: true,
                rol: true,
                active: true,
                createdAt: true
            }
        });
        return successResponse(users, 'Usuarios obtenidos con éxito');
    } catch (error) {
        return errorResponse('Error al obtener los usuarios', 500);
    }
};
 
export const getAllSocioService = async(clubId) => {

    try {
        const socios = await prisma.user.findMany({
            where: {
                clubId,
                rol: "USER"
            },
            select: {
                id: true,
                email: true,
                name: true,
                rol: true,
                active: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return successResponse(socios, 'Usuarios obtenidos con éxito');
    } catch (error) {
        return errorResponse('Error al obtener los socios', 500);
    }
}



export const deleteUserService = async(req) => {
    const {id} = req.params;
   
    try {
        await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        return successResponse(null, 'Usuario eliminado con éxito');

    } catch (error) {
        if (error.code === 'P2025') {
            return errorResponse('Usuario no encontrado', 404);
        }
        return errorResponse('Error al eliminar el usuario', 500);
    }
};