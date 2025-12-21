const express = require('express');
const router = express.Router();
const CharacterController = require('../controllers/CharacterController');
const RelationshipController = require('../controllers/RelationshipController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateRequest, characterValidation, relationshipValidation, idParam, projectIdParam, paginationQuery } = require('../middlewares/validateMiddleware');

router.use(authenticate);

// Character routes
router.get('/project/:projectId', projectIdParam, paginationQuery, validateRequest, CharacterController.getCharacters);
router.get('/:id', idParam, validateRequest, CharacterController.getCharacter);
router.post('/project/:projectId', characterValidation.create, validateRequest, CharacterController.createCharacter);
router.put('/:id', characterValidation.update, validateRequest, CharacterController.updateCharacter);
router.delete('/:id', idParam, validateRequest, CharacterController.deleteCharacter);

// Relationship routes
router.get('/project/:projectId/relationships', projectIdParam, validateRequest, RelationshipController.getRelationships);
router.get('/:characterId/relationships', RelationshipController.getCharacterRelationships);
router.post('/relationships', relationshipValidation.create, validateRequest, RelationshipController.createRelationship);
router.put('/relationships/:id', relationshipValidation.update, validateRequest, RelationshipController.updateRelationship);
router.delete('/relationships/:id', idParam, validateRequest, RelationshipController.deleteRelationship);

module.exports = router;
