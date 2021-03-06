const express = require('express')
const router = express.Router()
const EncountersController = require('../controllers/encounters.controller')
const passport = require('passport')
const authenticate = passport.authenticate('jwt', { session: false })

router.get('/', EncountersController.getAllEncounters)

router.get('/:encounterId', EncountersController.getEncounter)

router.post('/:encounterId/setActive', EncountersController.setActiveEncounter)

router.post('/', EncountersController.createEncounter)

router.patch('/:encounterId', EncountersController.patchEncounter)

router.delete('/:encounterId', EncountersController.deleteEncounter)

router.delete('/', EncountersController.deleteAllEncounters)

module.exports = router
