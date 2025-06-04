import prisma from "../config/db.js";

export const createOrder = async (orderData) => {
    try {
        const { comment, userId,  date, items, time, total } = orderData;
        
        // Formatear la fecha a string en formato YYYY-MM-DD
        const formattedDate = new Date(date).toISOString().split('T')[0];
        
        const order = await prisma.order.create({
            data: {
                userId,
                comment: comment || '',
                dateOrder: formattedDate,
                hourOrder: time,
                total: parseInt(total),
                status: 'PENDING',
                items: {
                    create: items.map(item => ({
                        productId: item.id,
                        quantity: parseFloat(item.quantity)
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
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
        const {userId} = req.params;

        const order = await prisma.order.findMany({
            where:{
                userId
            },
            include:{
                items: {
                    include: {
                        product: true
                    }
                }
            }
        })
        return order;
    } catch (error) {
        console.log(error);
        throw error;
    }
}