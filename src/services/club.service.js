import prisma from "../config/db.js";

export const createClubService = async (req) => {
    try {
        let imageUrl = null;
        
        if (req.file) {
            imageUrl = `http://localhost:8080/uploads/${req.file.filename}`;
        }



        const create = await prisma.club.create({
            data: {
                name: req.body.name,
                description: req.body.description,
                image: imageUrl,
                address: req.body.address,
                phone: req.body.phone,
                email: req.body.email,
                website: req.body.website,
                active: true
            },
            select: {
                id: true,
                name: true,
                description: true,
                image: true,
                address: true,
                phone: true,
                email: true,
                website: true,
                active: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return {
            status: 201,
            message: "Club creado exitosamente",
            data: create
        };
    } catch (error) {
        return {
            status: 500,
            message: "Error al crear el club",
            error: error.message
        };
    }
}

export const updateClubStatusService = async (req) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        const updatedClub = await prisma.club.update({
            where: {
                id: id
            },
            data: {
                active: active
            },
            select: {
                id: true,
                name: true,
                active: true,
                updatedAt: true
            }
        });

        return {
            status: 200,
            message: "Estado del club actualizado exitosamente",
            data: updatedClub
        };
    } catch (error) {
        return {
            status: 500,
            message: "Error al actualizar el estado del club",
            error: error.message
        };
    }
}

export const updateUserClubService = async (req) => {
    try {
        const { userId } = req.params;
        const { clubId } = req.body;

        const updatedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                clubId: clubId
            },
            select: {
                id: true,
                name: true,
                email: true,
                clubId: true,
                club: {
                    select: {
                        id: true,
                        name: true,
                        active: true
                    }
                }
            }
        });

        return {
            status: 200,
            message: "Club del usuario actualizado exitosamente",
            data: updatedUser
        };
    } catch (error) {
        return {
            status: 500,
            message: "Error al actualizar el club del usuario",
            error: error.message
        };
    }
}

export const updateClubImageService = async (req) => {
    try {
        const { id } = req.params;
        
        if (!req.file) {
            return {
                status: 400,
                message: "No se ha proporcionado ninguna imagen"
            };
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        const updatedClub = await prisma.club.update({
            where: {
                id: id
            },
            data: {
                image: imageUrl
            },
            select: {
                id: true,
                name: true,
                image: true,
                updatedAt: true
            }
        });

        return {
            status: 200,
            message: "Imagen del club actualizada exitosamente",
            data: updatedClub
        };
    } catch (error) {
        return {
            status: 500,
            message: "Error al actualizar la imagen del club",
            error: error.message
        };
    }
}


export const getClubByIdService = async(req) => {
    try {
        const {clubId} = req.params;

        const dataClub = await prisma.club.findUnique({
            where: { 
                id: clubId
            },
            include:{
                users: {
                    where:{rol: 'USER'}
                },
                products: true
            }
        });       

        if (!dataClub) {
            return {
                status: 404,
                message: "Club no encontrado"
            };
        }

        return {
            status: 200,
            data: dataClub
        };
    } catch (error) {
        return {
            status: 500,
            message: "Error al obtener los datos del club",
            error: error.message
        };
    }
}