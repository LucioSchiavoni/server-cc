import prisma from "../config/db.js";

export const validateClubScheduleService = (clubSchedules) => {
    const errors = [];
    
    // Validar mínimo 2 días diferentes en la semana
    const uniqueDays = new Set(clubSchedules.map(schedule => schedule.dayOfWeek));
    if (uniqueDays.size < 2) {
      errors.push("El club debe operar al menos 2 días por semana");
    }
    
    // Validar cada horario individualmente
    clubSchedules.forEach((schedule) => {
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const dayName = dayNames[schedule.dayOfWeek];
      
      // Convertir horarios a minutos para facilitar cálculos
      const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
      const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
      
      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;
      
      // Validar horario laboral (8:00 - 16:00)
      if (startTimeInMinutes < 480) { // 8:00 = 480 minutos
        errors.push(`${dayName}: horario debe iniciar después de las 08:00`);
      }
      
      if (endTimeInMinutes > 960) { // 16:00 = 960 minutos
        errors.push(`${dayName}: horario debe terminar antes de las 16:00`);
      }
      
      // Validar mínimo 3 horas de operación
      const durationInMinutes = endTimeInMinutes - startTimeInMinutes;
      if (durationInMinutes < 180) { // 3 horas = 180 minutos
        errors.push(`${dayName}: debe operar mínimo 3 horas por día`);
      }
      
      // Validar que hora fin sea mayor a hora inicio
      if (endTimeInMinutes <= startTimeInMinutes) {
        errors.push(`${dayName}: la hora de fin debe ser posterior a la hora de inicio`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };


  export const createSchedulesService = async (clubId, schedules) => {
    try {
      const club = await prisma.club.findUnique({
        where: { id: clubId }
      });
      
      if (!club) {
        throw new Error('Club no encontrado');
      }
  
      // 2. Validar que los horarios cumplan con la ley IRCCA
      const validation = validateClubScheduleService(schedules);
      if (!validation.isValid) {
        throw new Error(`Horarios inválidos: ${validation.errors.join(', ')}`);
      }
  
      // 3. Eliminar horarios existentes del club (para evitar duplicados)
      await prisma.datesClub.deleteMany({
        where: { clubId }
      });
  
      // 4. Crear los nuevos horarios en la base de datos
      await prisma.datesClub.createMany({
        data: schedules.map(schedule => ({
          ...schedule,
          clubId
        }))
      });
  
      return await getClubSchedulesService(clubId);
    } catch (error) {
      throw error;
    }
  };


  export const getClubSchedulesService = async (clubId) => {
    try {
      const schedules = await prisma.datesClub.findMany({
        where: { 
          clubId,
          isActive: true 
        },
        orderBy: { dayOfWeek: 'asc' }
      });
  
      //  Agregar el nombre del día para facilitar el uso en frontend
      return schedules.map(schedule => ({
        ...schedule,
        dayName: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][schedule.dayOfWeek]
      }));
    } catch (error) {
      throw error;
    }
  };


  export const updateClubScheduleService = async (scheduleId, updateData) => {
    try {
      // 1. Buscar el horario que se quiere actualizar
      const schedule = await prisma.datesClub.findUnique({
        where: { id: scheduleId }
      });
  
      if (!schedule) {
        throw new Error('Horario no encontrado');
      }
  
      // 2. Obtener todos los horarios del club para validar el conjunto completo
      const allSchedules = await prisma.datesClub.findMany({
        where: { clubId: schedule.clubId }
      });
  
      // 3. Simular cómo quedarían los horarios después de la actualización
      const updatedSchedules = allSchedules.map(s => 
        s.id === scheduleId ? { ...s, ...updateData } : s
      );
  
      // 4. Validar que el conjunto de horarios siga cumpliendo la ley
      const validation = validateClubScheduleService(updatedSchedules);
      if (!validation.isValid) {
        throw new Error(`Horarios inválidos: ${validation.errors.join(', ')}`);
      }
  
      // 5. Actualizar el horario en la base de datos
      return await prisma.datesClub.update({
        where: { id: scheduleId },
        data: updateData
      });
    } catch (error) {
      throw error;
    }
  };
  
  // Función para verificar si se puede hacer una reserva en un día/hora específicos
  export const canMakeReservationService = async (clubId, dayOfWeek, requestedTime) => {
    try {
      // 1. Buscar si el club opera en el día solicitado
      const clubSchedule = await prisma.datesClub.findFirst({
        where: {
          clubId,
          dayOfWeek,
          isActive: true
        }
      });
  
      // 2. Si no opera ese día, no se puede hacer reserva
      if (!clubSchedule) return false;
  
      // 3. Verificar si la hora solicitada está dentro del horario de operación
      return requestedTime >= clubSchedule.startTime && 
             requestedTime <= clubSchedule.endTime;
    } catch (error) {
      throw error;
    }
  };
  
  // Función para obtener los días disponibles para hacer reservas
  export const getAvailableDaysForBookingService = async (clubId) => {
    try {
      return await getClubSchedulesService(clubId);
    } catch (error) {
      throw error;
    }
  };
  
  // Función para eliminar un horario específico
  export const deleteClubScheduleService = async (scheduleId) => {
    try {
      // 1. Buscar el horario que se quiere eliminar
      const schedule = await prisma.datesClub.findUnique({
        where: { id: scheduleId }
      });
  
      if (!schedule) {
        throw new Error('Horario no encontrado');
      }
  
      // 2. Verificar cuántos horarios quedarían después de eliminar este
      const remainingSchedules = await prisma.datesClub.findMany({
        where: { 
          clubId: schedule.clubId,
          id: { not: scheduleId }
        }
      });
  
      // 3. Validar que después de eliminar sigan cumpliendo con mínimo 2 días
      if (remainingSchedules.length < 2) {
        throw new Error('No se puede eliminar el horario. El club debe mantener al menos 2 días de operación');
      }
  
      // 4. Eliminar el horario de la base de datos
      return await prisma.datesClub.delete({
        where: { id: scheduleId }
      });
    } catch (error) {
      throw error;
    }
}