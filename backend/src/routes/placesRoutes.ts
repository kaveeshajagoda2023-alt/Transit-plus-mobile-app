import { Router } from 'express';
import { placesController } from '../controllers/placesController.js';

const router = Router();

router.get('/services/nearby', placesController.getNearbyServices);
router.get('/places/saved', placesController.getSavedPlaces);
router.get('/places/recent', placesController.getRecentSearches);
router.post('/places/recent', placesController.addRecentSearch);

export default router;
