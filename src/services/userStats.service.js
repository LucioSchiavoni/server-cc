import { prisma } from '../config/db.js'

export const getUserMonthlyStats = async (userId, year = null, month = null) => {
    try {
        const currentDate = new Date();
        const targetYear = year || currentDate.getFullYear();
        const targetMonth = month || (currentDate.getMonth() + 1);

        const stats = await prisma.userMonthlyStats.findUnique({
            where: {
                userId_year_month: {
                    userId,
                    year: targetYear,
                    month: targetMonth
                }
            },
            include: {
                user: {
                    include: {
                        club: {
                            select: {
                                name: true,
                                maxMonthlyGrams: true
                            }
                        }
                    }
                }
            }
        });

        if (!stats) {
            // Si no hay estadísticas, crear una respuesta con valores por defecto
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    club: {
                        select: {
                            name: true,
                            maxMonthlyGrams: true
                        }
                    }
                }
            });

            const monthlyLimit = user?.club?.maxMonthlyGrams && user.club.maxMonthlyGrams > 0 
                ? user.club.maxMonthlyGrams 
                : 40;

            return {
                userId,
                year: targetYear,
                month: targetMonth,
                reservedGrams: 0,
                totalGrams: 0,
                totalOrders: 0,
                monthlyLimit,
                availableGrams: monthlyLimit,
                user
            };
        }

        const monthlyLimit = stats.user.club?.maxMonthlyGrams && stats.user.club.maxMonthlyGrams > 0 
            ? stats.user.club.maxMonthlyGrams 
            : 40;

        const totalUsed = stats.reservedGrams + stats.totalGrams;
        const availableGrams = Math.max(0, monthlyLimit - totalUsed);

        return {
            ...stats,
            monthlyLimit,
            totalUsed,
            availableGrams
        };

    } catch (error) {
        console.error('Error getting user monthly stats:', error);
        throw error;
    }
};