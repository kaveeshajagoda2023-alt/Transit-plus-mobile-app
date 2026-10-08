import { Router } from 'express';
import { routeController } from '../controllers/routeController.js';

const router = Router();

// Routes & Search
router.get('/', routeController.getRoutes);
router.get('/search', routeController.searchRoutes);

// C, R, D – Saved Routes CRUD (Must precede /:id)
router.get('/saved', routeController.getSavedRoutes);
router.post('/saved', routeController.saveRoute);
router.delete('/saved/:id', routeController.deleteSavedRoute);

// R – Route ETA & Details
router.get('/:id/eta', routeController.getRouteETA);
router.get('/:id', routeController.getRouteById);

export default router;
