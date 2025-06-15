import { Router } from "express";
import {createSchedules, getSchedules, getAvailableDays, checkAvailability, updateSchedule, deleteSchedule} from '../controllers/clubSchedule.controller.js';


const clubScheduleRouter = Router();




// Ruta para crear horarios para un club
// POST /api/clubs/:clubId/schedules
clubScheduleRouter.post('/club/:clubId/schedules', createSchedules);

// Ruta para obtener horarios de un club
// GET /api/clubs/:clubId/schedules
clubScheduleRouter.get('/club/:clubId/schedules', getSchedules);

// Ruta para obtener días disponibles para reservas
// GET /api/clubs/:clubId/available-days
clubScheduleRouter.get('/club/:clubId/available-days', getAvailableDays);

// Ruta para verificar disponibilidad para una fecha/hora específica
// GET /api/clubs/:clubId/check-availability?dayOfWeek=1&time=10:30
clubScheduleRouter.get('/club/:clubId/check-availability', checkAvailability);

// Ruta para actualizar un horario específico
// PUT /api/schedules/:scheduleId
clubScheduleRouter.put('/schedules/:scheduleId', updateSchedule);

// Ruta para eliminar un horario específico
// DELETE /api/schedules/:scheduleId
clubScheduleRouter.delete('/schedules/:scheduleId', deleteSchedule);

export default clubScheduleRouter;

// ===== EJEMPLO DE USO =====
/*
// POST /clubs/club123/schedules
{
  "schedules": [
    {
      "dayOfWeek": 1, // Lunes
      "startTime": "09:00",
      "endTime": "15:00",
      "maxCapacity": 20
    },
    {
      "dayOfWeek": 3, // Miércoles
      "startTime": "10:00",
      "endTime": "14:00",
      "maxCapacity": 15
    }
  ]
}
*/