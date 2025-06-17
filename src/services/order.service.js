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


export const updateUserMonthlyStatsService = async (userId, grams, orderDate) => {
    try {
        const date = new Date(orderDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const monthlyStats = await prisma.userMonthlyStats.upsert({
            where: {
                userId_year_month: {
                    userId,
                    year,
                    month
                }
            },
            update: {
                totalGrams: {
                    increment: grams
                },
                totalOrders: {
                    increment: 1
                }
            },
            create: {
                userId,
                year,
                month,
                totalGrams: grams,
                totalOrders: 1
            }
        });
        
        return monthlyStats;
    } catch (error) {
        console.log('Error updating monthly stats:', error);
        throw error;
    }
};


export const completeOrderService = async (orderId) => {
    try {
        return await prisma.$transaction(async (tx) => {

            const currentOrder = await tx.order.findUnique({
                where: { id: orderId },
                include: { user: true }
            });
            
            if (!currentOrder) {
                throw new Error('Orden no encontrada');
            }
            
            if (currentOrder.status === 'COMPLETED') {
                throw new Error('La orden ya está completada');
            }

            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: { status: 'COMPLETED' },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    },
                    user: true
                }
            });

            // Actualizar estadísticas mensuales del usuario
            const date = new Date(currentOrder.dateOrder);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            
            await tx.userMonthlyStats.upsert({
                where: {
                    userId_year_month: {
                        userId: currentOrder.userId,
                        year,
                        month
                    }
                },
                update: {
                    totalGrams: {
                        increment: currentOrder.total
                    },
                    totalOrders: {
                        increment: 1
                    }
                },
                create: {
                    userId: currentOrder.userId,
                    year,
                    month,
                    totalGrams: currentOrder.total,
                    totalOrders: 1
                }
            });
            
            return updatedOrder;
        });
    } catch (error) {
        console.log('Error completing order:', error);
        throw error;
    }
};

export const cancelOrderService = async (orderId) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });
        
        if (!order) {
            throw new Error('Orden no encontrada');
        }
        
        if (order.status === 'COMPLETED') {
            throw new Error('No se puede cancelar una orden completada');
        }
        
        return await prisma.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: true
            }
        });
    } catch (error) {
        console.log('Error cancelling order:', error);
        throw error;
    }
};

export const getUserMonthlyStatsService = async (userId, year) => {
    try {
        return await prisma.userMonthlyStats.findMany({
            where: {
                userId,
                year
            },
            orderBy: {
                month: 'asc'
            }
        });
    } catch (error) {
        console.log('Error getting monthly stats:', error);
        throw error;
    }
};