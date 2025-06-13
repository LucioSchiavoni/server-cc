import { 
    registerService, 
    loginService, 
    authService, 
    changePasswordService, 
    getAllUserService, 
    deleteUserService, 
    getAllSocioService
} from '../services/user.service.js';

export const register = async (req, res) => {
    try {
        const result = await registerService(req);
     return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Error interno del servidor'
        });
    }
};

export const login = async (req, res) => {
    try {
        const result = await loginService(req);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Error interno del servidor'
        });
    }
};

export const auth = async (req, res) => {
    try {
        const result = await authService(req);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Error interno del servidor'
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const result = await changePasswordService(req);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Error interno del servidor'
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const result = await getAllUserService();
        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Error interno del servidor'
        });
    }
};

export const getAllSocio = async(req, res) => {
     const {clubId} = req.params;
    try {
        const result = await getAllSocioService(clubId);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Error interno del servidor'
        });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const result = await deleteUserService(req);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Error interno del servidor'
        });
    }
};
