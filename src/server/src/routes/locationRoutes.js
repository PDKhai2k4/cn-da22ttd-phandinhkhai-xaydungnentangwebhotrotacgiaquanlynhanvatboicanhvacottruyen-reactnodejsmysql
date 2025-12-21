const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/LocationController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateRequest, locationValidation, idParam, projectIdParam, paginationQuery } = require('../middlewares/validateMiddleware');

router.use(authenticate);

// GET /locations/project/:projectId - List locations
router.get('/project/:projectId', projectIdParam, paginationQuery, validateRequest, LocationController.getLocations);

// GET /locations/project/:projectId/tree - Get location tree
router.get('/project/:projectId/tree', projectIdParam, validateRequest, LocationController.getLocationTree);

// GET /locations/:id - Get single location
router.get('/:id', idParam, validateRequest, LocationController.getLocation);

// POST /locations/project/:projectId - Create location
router.post('/project/:projectId', locationValidation.create, validateRequest, LocationController.createLocation);

// PUT /locations/:id - Update location
router.put('/:id', locationValidation.update, validateRequest, LocationController.updateLocation);

// DELETE /locations/:id - Delete location
router.delete('/:id', idParam, validateRequest, LocationController.deleteLocation);

module.exports = router;
