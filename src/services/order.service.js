import prisma from "../config/db.js";

export const createOrder = async (orderData) => {
    try {
        const { comment, userId, date, items, time, total } = orderData;
        
        const formattedDate = new Date(date).toISOString().split('T')[0];
        
        const order = await prisma.order.create({
            data: {
                user: {
                    connect: {
                        id: userId
                    }
                },
                comment: comment || '',
                dateOrder: formattedDate,
                hourOrder: time,
                total: parseInt(total),
                status: 'PENDING',
                items: {
                    create: items.map(item => ({
                        product: {
                            connect: {
                                id: item.id
                            }
                        },
                        quantity: parseFloat(item.quantity)
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: true
            }
        });
        
        return order;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getOrders = async () => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        return orders;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getOrderByUserIdService = async(req) => {
    try {
        const {clubId} = req.params;
        
        const club = await prisma.club.findUnique({
            where: { id: clubId }
        });

        if (!club) return [];

        const usersInClub = await prisma.user.findMany({
            where: { clubId },
            select: { id: true }
        });

        if (usersInClub.length === 0) return [];

        const userIds = usersInClub.map(user => user.id);

        return await prisma.order.findMany({
            where: {
                userId: { in: userIds }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        clubId: true
                    }
                }
            }
        });
    } catch (error) {
        throw error;
    }
}


export const getOrderBySocioIdService = async(req) => {
    try {
        const {socioId} = req.params;
        
        const socio = await prisma.user.findUnique({
            where: { id: socioId }
        });

        if (!socio) return [];

        return await prisma.order.findMany({
            where: {
                userId: socioId
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        clubId: true
                    }
                }
            }
        });
    } catch (error) {
        throw error;
    }
}