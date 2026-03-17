import { Router } from 'express';
import {
  createAppointment,
  deleteAppointment,
  getAppointmentById,
  listAppointments,
  updateAppointment,
  updateAppointmentStatus
} from '../controllers/appointmentController';

const appointmentRoutes = Router();

appointmentRoutes.post('/', createAppointment);
appointmentRoutes.get('/', listAppointments);
appointmentRoutes.get('/:id', getAppointmentById);
appointmentRoutes.put('/:id', updateAppointment);
appointmentRoutes.delete('/:id', deleteAppointment);
appointmentRoutes.patch('/:id/status', updateAppointmentStatus);

export { appointmentRoutes };

