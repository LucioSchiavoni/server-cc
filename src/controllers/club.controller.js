import { createClubService, updateClubStatusService, updateUserClubService, updateClubImageService, getClubByIdService, updateClubService } from "../services/club.service.js";

export const createClub = async (req, res) => {
    try {
        const result = await createClubService(req);
        
        if (result.status === 201) {
            return res.status(201).json(result);
        } else {
            return res.status(result.status).json(result);
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

export const updateClubStatus = async (req, res) => {
    try {
        const result = await updateClubStatusService(req);
        
        if (result.status === 200) {
            return res.status(200).json(result);
        } else {
            return res.status(result.status).json(result);
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

export const updateUserClub = async (req, res) => {
    try {
        const result = await updateUserClubService(req);
        
        if (result.status === 200) {
            return res.status(200).json(result);
        } else {
            return res.status(result.status).json(result);
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

export const updateClubImage = async (req, res) => {
    try {
        const result = await updateClubImageService(req);
        
        if (result.status === 200) {
            return res.status(200).json(result);
        } else {
            return res.status(result.status).json(result);
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

export const getClubById = async(req,res) => {
    try {
        const result = await getClubByIdService(req);
        if (result.status === 200){
            return res.status(200).json(result)
        }else {
            return res.status(result.status).json(result);
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error interno del servidor",
            error: error.message
        });
    }
}

export const updateClub = async (req, res) => {
    try {
        const result = await updateClubService(req);
        
        if (result.status === 200) {
            return res.status(200).json(result);
        } else {
            return res.status(result.status).json(result);
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};