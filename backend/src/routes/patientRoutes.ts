import { Router } from 'express';
import {
  createPatient,
  deletePatient,
  getPatientById,
  listPatients,
  updatePatient
} from '../controllers/patientController';

const patientRoutes = Router();

patientRoutes.post('/', createPatient);
patientRoutes.get('/', listPatients);
patientRoutes.get('/:id', getPatientById);
patientRoutes.put('/:id', updatePatient);
patientRoutes.delete('/:id', deletePatient);

export { patientRoutes };

