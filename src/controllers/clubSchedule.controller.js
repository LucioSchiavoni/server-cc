import { getClubSchedulesService, updateClubScheduleService, canMakeReservationService, getAvailableDaysForBookingService, deleteClubScheduleService, createSchedulesService} from '../services/clubSchedule.service.js';


export const createSchedules = async (req, res) => {
    try {
      // 1. Extraer el ID del club de los parámetros de la URL
      const { clubId } = req.params;
      // 2. Extraer los horarios del cuerpo de la petición
      const { schedules } = req.body;
  
      // 3. Validar que se enviaron horarios válidos
      if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un array de horarios válido'
        });
      }
  
      // 4. Llamar al servicio para crear los horarios
      const result = await createSchedulesService(clubId, schedules);

      // 5. Responder con éxito
      res.status(201).json({
        success: true,
        message: 'Horarios creados exitosamente',
        data: result
      });
    } catch (error) {
      // 6. Manejar errores y responder adecuadamente
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // Controlador para obtener horarios del club
  export const getSchedules = async (req, res) => {
    try {
      // 1. Extraer el ID del club de los parámetros
      const { clubId } = req.params;
      
      // 2. Obtener los horarios usando el servicio
      const schedules = await getClubSchedulesService(clubId);
      
      // 3. Responder con los horarios encontrados
      res.json({
        success: true,
        data: schedules
      });
    } catch (error) {
      // 4. Manejar errores
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // Controlador para actualizar un horario específico
  export const updateSchedule = async (req, res) => {
    try {
      // 1. Extraer el ID del horario de los parámetros
      const { scheduleId } = req.params;
      // 2. Extraer los datos de actualización del cuerpo
      const updateData = req.body;
  
      // 3. Actualizar usando el servicio
      const result = await updateClubScheduleService(scheduleId, updateData);
      
      // 4. Responder con éxito
      res.json({
        success: true,
        message: 'Horario actualizado exitosamente',
        data: result
      });
    } catch (error) {
      // 5. Manejar errores
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // Controlador para eliminar un horario
  export const deleteSchedule = async (req, res) => {
    try {
      // 1. Extraer el ID del horario
      const { scheduleId } = req.params;
      
      // 2. Eliminar usando el servicio
      await deleteClubScheduleService(scheduleId);

      // 3. Responder confirmando la eliminación
      res.json({
        success: true,
        message: 'Horario eliminado exitosamente'
      });
    } catch (error) {
      // 4. Manejar errores
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // Controlador para verificar disponibilidad para reserva
  export const checkAvailability = async (req, res) => {
    try {
      // 1. Extraer el ID del club de los parámetros
      const { clubId } = req.params;
      // 2. Extraer día y hora de los query parameters
      const { dayOfWeek, time } = req.query;
  
      // 3. Validar que se enviaron los parámetros necesarios
      if (dayOfWeek === undefined || !time) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren dayOfWeek y time'
        });
      }
  
      // 4. Verificar disponibilidad usando el servicio
      const isAvailable = await canMakeReservationService(
        clubId, 
        parseInt(dayOfWeek), 
        time
      );
      
      // 5. Responder con el resultado
      res.json({
        success: true,
        data: { isAvailable }
      });
    } catch (error) {
      // 6. Manejar errores
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // Controlador para obtener días disponibles para reservas
  export const getAvailableDays = async (req, res) => {
    try {
      // 1. Extraer el ID del club
      const { clubId } = req.params;
      
      // 2. Obtener días disponibles usando el servicio
      const availableDays = await getAvailableDaysForBookingService(clubId);

      // 3. Responder con los días disponibles
      res.json({
        success: true,
        data: availableDays
      });
    } catch (error) {
      // 4. Manejar errores
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };