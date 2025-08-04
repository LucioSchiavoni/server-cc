import prisma from "../config/db.js";

// Función para calcular gramos totales basándose en los items
export const calculateTotalGrams = async (items) => {
    try {
        let totalGrams = 0;
        
        for (const item of items) {
            // Obtener el producto para verificar que existe
            const product = await prisma.product.findUnique({
                where: { id: item.id },
                select: { name: true }
            });
            
            if (!product) {
                throw new Error(`Producto con id ${item.id} no encontrado`);
            }
            
            // Los gramos están en la cantidad del item
            const itemGrams = parseFloat(item.quantity);
            
            if (isNaN(itemGrams) || itemGrams <= 0) {
                throw new Error(`Cantidad inválida para producto ${product.name}: ${item.quantity}`);
            }
            
            totalGrams += itemGrams;
            
        }
        
        return totalGrams;
        
    } catch (error) {
        throw error;
    }
};

export const createOrder = async (orderData) => {
    try {
        const { comment, userId, date, items, time, total } = orderData;
        
        const formattedDate = new Date(date).toISOString().split('T')[0];
        
        const existingOrder = await prisma.order.findFirst({
            where: {
            userId,
            dateOrder: formattedDate,
            status: 'PENDING'
            },
        });

        if (existingOrder) {
        throw new Error('Ya existe una reserva para este usuario en esta fecha');
        }
        
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

export const updateOrder = async (orderId, updateData) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order || order.status !== 'PENDING') {
        throw new Error('La orden no existe o no se puede editar');
    }

    const { comment, time, items, total } = updateData;

    return await prisma.$transaction(async (tx) => {
        await tx.orderItem.deleteMany({
            where: { orderId }
        });

        const updatedOrder = await tx.order.update({
            where: { id: orderId },
            data: {
                comment: comment || '',
                hourOrder: time,
                total: parseInt(total),
                items: {
                    create: items.map(item => ({
                        product: {
                            connect: { id: item.id }
                        },
                        quantity: parseFloat(item.quantity)
                    }))
                }
            },
            include: {
                items: { include: { product: true } },
                user: true
            }
        });

        return updatedOrder;
    });
};


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
            },
            orderBy: {
                dateOrder: 'desc'
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

        const orders = await prisma.order.findMany({
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
            },
            orderBy: [
                { dateOrder: 'desc' }, 
                { hourOrder: 'desc' }   
            ]
        });

        const statusPriority = {
            'PENDING': 1,
            'CANCELLED': 2,
            'COMPLETED': 3
        };

        return orders.sort((a, b) => {
            const statusDiff = statusPriority[a.status] - statusPriority[b.status];
            if (statusDiff !== 0) return statusDiff;

            const dateA = new Date(`${a.dateOrder}T${a.hourOrder}`);
            const dateB = new Date(`${b.dateOrder}T${b.hourOrder}`);
            return dateB.getTime() - dateA.getTime();
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

            if (!currentOrder.userId) {
                throw new Error('La orden no tiene un usuario asociado');
            }

            // Actualizar el estado de la orden
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

            await moveReservedToConfirmed(
                currentOrder.userId, 
                currentOrder.total, 
                currentOrder.dateOrder
            );
            
            return updatedOrder;
        });
    } catch (error) {
        console.log('Error completing order:', error);
        throw error;
    }
};

export const cancelOrderService = async (orderId) => {
    try {
        return await prisma.$transaction(async (tx) => {
            const currentOrder = await tx.order.findUnique({
                where: { id: orderId },
                include: { 
                    items: true,
                    user: true 
                }
            });
            
            if (!currentOrder) {
                throw new Error('Orden no encontrada');
            }
            
            if (currentOrder.status === 'COMPLETED') {
                throw new Error('No se puede cancelar una orden completada');
            }
            
            if (currentOrder.status === 'CANCELLED') {
                throw new Error('La orden ya está cancelada');
            }
            
            const totalGrams = currentOrder.items.reduce((sum, item) => sum + item.quantity, 0);
            
            if (currentOrder.userId && totalGrams > 0) {
                await removeReservedGrams(currentOrder.userId, totalGrams, currentOrder.dateOrder);
            }
            
            const cancelledOrder = await tx.order.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    },
                    user: {
                        include:{
                            club: true
                        }
                    }
                }
            });
            
            return cancelledOrder;
        });
    } catch (error) {
        throw error;
    }
};
export const getUserMonthlyStatsService = async (userId, year) => {
    try {
        return await prisma.userMonthlyStats.findMany({
            where: {
                userId
            },
            orderBy: {
                month: 'asc'
            }
        });
    } catch (error) {
        throw error;
    }
};

export const existingORderService = async (userId, date) => {
    try {
        const formattedDate = new Date(date).toISOString().split('T')[0];
        
        return await prisma.order.findFirst({
            where: {
                userId,
                dateOrder: formattedDate,
                status: { in: ['PENDING'] }
            }
        });
    } catch (error) {
        console.log('Error checking existing order:', error);
        throw error;
    }
}

export const validateMonthlyGramLimit = async (userId, orderGrams, orderDate) => {
    try {
        const date = new Date(orderDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        // Obtener información del usuario y su club
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                club: {
                    select: {
                        maxMonthlyGrams: true,
                        name: true
                    }
                }
            }
        });

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Determinar el límite mensual (40g por defecto o el del club)
        const monthlyLimit = user.club?.maxMonthlyGrams && user.club.maxMonthlyGrams > 0 
            ? user.club.maxMonthlyGrams 
            : 40;

        // Obtener estadísticas mensuales actuales del usuario
        const currentStats = await prisma.userMonthlyStats.findUnique({
            where: {
                userId_year_month: {
                    userId,
                    year,
                    month
                }
            }
        });

        // Calcular gramos ya reservados y confirmados en el mes
        const currentReservedGrams = currentStats?.reservedGrams || 0;
        const currentTotalGrams = currentStats?.totalGrams || 0;
        
        // Total actual (reservado + confirmado)
        const currentTotalUsed = currentReservedGrams + currentTotalGrams;
        
        // Verificar si la nueva orden excedería el límite
        const newTotal = currentTotalUsed + orderGrams;

        if (newTotal > monthlyLimit) {
            const availableGrams = monthlyLimit - currentTotalUsed;
            return {
                isValid: false,
                error: `Límite mensual excedido. Límite: ${monthlyLimit}g, Usado: ${currentTotalUsed}g, Disponible: ${availableGrams}g, Solicitado: ${orderGrams}g`,
                availableGrams: Math.max(0, availableGrams),
                monthlyLimit,
                currentUsed: currentTotalUsed,
                requestedGrams: orderGrams
            };
        }

        return {
            isValid: true,
            monthlyLimit,
            currentUsed: currentTotalUsed,
            requestedGrams: orderGrams,
            availableAfterOrder: monthlyLimit - newTotal
        };

    } catch (error) {
        throw error;
    }
};


export const addReservedGrams = async (userId, orderGrams, orderDate) => {
    try {
        const date = new Date(orderDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        await prisma.userMonthlyStats.upsert({
            where: {
                userId_year_month: {
                    userId,
                    year,
                    month
                }
            },
            update: {
                reservedGrams: {
                    increment: orderGrams
                }
            },
            create: {
                userId,
                year,
                month,
                reservedGrams: orderGrams,
                totalGrams: 0,
                totalOrders: 0
            }
        });

        return {
            success: true,
            message: `${orderGrams}g agregados como reservados`
        };

    } catch (error) {
        throw error;
    }
};

export const moveReservedToConfirmed = async (userId, orderGrams, orderDate) => {
    try {
        const date = new Date(orderDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        return await prisma.$transaction(async (tx) => {
            // Obtener estadísticas actuales
            const currentStats = await tx.userMonthlyStats.findUnique({
                where: {
                    userId_year_month: {
                        userId,
                        year,
                        month
                    }
                }
            });

            if (!currentStats) {
                throw new Error('No se encontraron estadísticas mensuales para este usuario');
            }

            // Verificar que hay suficientes gramos reservados
            if (currentStats.reservedGrams < orderGrams) {
                // Ajustar para evitar valores negativos
                const actualReserved = Math.max(0, currentStats.reservedGrams);
                const remainingToAdd = orderGrams - actualReserved;

                await tx.userMonthlyStats.update({
                    where: {
                        userId_year_month: {
                            userId,
                            year,
                            month
                        }
                    },
                    data: {
                        reservedGrams: 0, // Poner en 0 los reservados
                        totalGrams: {
                            increment: orderGrams // Agregar todos los gramos a confirmados
                        },
                        totalOrders: {
                            increment: 1
                        }
                    }
                });

            } else {
                // Operación normal: mover de reservados a confirmados
                await tx.userMonthlyStats.update({
                    where: {
                        userId_year_month: {
                            userId,
                            year,
                            month
                        }
                    },
                    data: {
                        reservedGrams: {
                            decrement: orderGrams
                        },
                        totalGrams: {
                            increment: orderGrams
                        },
                        totalOrders: {
                            increment: 1
                        }
                    }
                });
            }

            return {
                success: true,
                message: `${orderGrams}g confirmados exitosamente`
            };
        });

    } catch (error) {
        throw error;
    }
};


export const cancelReservedGrams = async (userId, orderGrams, orderDate, tx = null) => {
    const prismaClient = tx || prisma;
    
    try {
        console.log('🔍 cancelReservedGrams - Parámetros recibidos:', { userId, orderGrams, orderDate });
        
        // Validar parámetros
        if (!userId || !orderGrams || !orderDate) {
            throw new Error(`Parámetros faltantes: userId=${userId}, orderGrams=${orderGrams}, orderDate=${orderDate}`);
        }
        
        // Parsear fecha
        const date = new Date(orderDate);
        
        // Validar que la fecha es válida
        if (isNaN(date.getTime())) {
            throw new Error(`Fecha inválida: ${orderDate}`);
        }
        
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        console.log('🔍 Fecha parseada:', { year, month });
        
        console.log('🔄 Ejecutando update en userMonthlyStats...');
        await prismaClient.userMonthlyStats.update({
            where: {
                userId_year_month: {
                    userId,
                    year,
                    month
                }
            },
            data: {
                reservedGrams: {
                    decrement: parseInt(orderGrams)
                }
            }
        });
        
        console.log('✅ userMonthlyStats actualizado exitosamente');
        
        return {
            success: true,
            message: `${orderGrams}g cancelados de reservados`
        };
    } catch (error) {
        console.log('❌ Error en cancelReservedGrams:', error);
        throw error;
    }
};

export const removeReservedGrams = async (userId, orderGrams, orderDate) => {
    try {
        const date = new Date(orderDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        await prisma.userMonthlyStats.upsert({
            where: {
                userId_year_month: {
                    userId,
                    year,
                    month
                }
            },
            update: {
                reservedGrams: {
                    decrement: orderGrams
                }
            },
            create: {
                userId,
                year,
                month,
                reservedGrams: 0, // Si no existe, crear con 0 (no debería pasar)
                totalGrams: 0,
                totalOrders: 0
            }
        });

        return {
            success: true,
            message: `${orderGrams}g removidos de reservados`
        };

    } catch (error) {
        throw error;
    }
};

export const deleteOrderService = async (orderId) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: true,
                user: true
            }
        });
        
        if (!order) {
            throw new Error('Orden no encontrada');
        }
        
        if (order.status === 'COMPLETED') {
            throw new Error('No se puede eliminar una orden completada');
        }
        
        if (order.userId) {
            const totalGrams = order.items.reduce((sum, item) => sum + item.quantity, 0);
            await removeReservedGrams(order.userId, totalGrams, order.dateOrder);
        }
        
        // Eliminar la orden
        const deletedOrder = await prisma.order.delete({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: true
            }
        });
        
        return deletedOrder;
        
    } catch (error) {
        throw error;
    }
};