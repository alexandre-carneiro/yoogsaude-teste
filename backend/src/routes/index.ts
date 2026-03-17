import { Router } from 'express';
import { patientRoutes } from './patientRoutes';
import { appointmentRoutes } from './appointmentRoutes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);

export { router };

