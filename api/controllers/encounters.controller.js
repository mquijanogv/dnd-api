const config = require('../../config/main')
const endpoint = `http://${config.host}:${config.port}/encounters/`
const mongoose = require('mongoose')
const Encounter = require('../models/encounter.model')

const returnError = (err, res) => {
  res.status(500).json({
    error: err.toString()
  })
}

const createEncounter = async (req, res, next) => {
  try {
    const encounter = new Encounter({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      status: req.body.status
    })
    const result = await encounter.save()
    const add = {
      request: {
        type: 'GET',
        url: endpoint + encounter._id
      }
    }
    res.status(201).json({
      status: {
        code: 201,
        message: 'Successfully created new Encounter document'
      },
      createdEncounter: {
        ...encounter._doc,
        ...add
      }
    })
  }
  catch (err) {
    console.log(err)
    res.status(400).json({
      status: {
        code: 400,
        message: 'Error creating Encounter document'
      }
    })
  }
}

const getAllEncounters = async (req, res, next) => {
  try {
    const docs = await Encounter.find().select('-__v').exec()
    const response = {
      count: docs.length,
      encounters: docs.map(doc => {
        const add = {
          request: {
            type: 'GET',
            url: endpoint + doc._id
          }
        }
        return {
          ...doc._doc,
          ...add
        }
      })
    }
    if (docs) {
      res.status(200).json({
        status: {
          code: 200,
          message: 'Successfully fetched all Encounter documents'
        },
        ...response
      })
    } else {
      res.status(404).json({
        status: {
          code: 404,
          message: 'No documents in Encounter collection'
        }
      })
    }
  }
  catch (err) {
    res.status(400).json({
      status: {
        code: 400,
        message: 'Error getting Encounter documents'
      }
    })
  }
}

const setActiveEncounter = async (req, res, next) => {
  try {
    const id = req.params.encounterId
    const existingActive = await Encounter.findOne({ status: 'Active' })
    const activeEncounter = await Encounter.findByIdAndUpdate(id, { $set: { status: 'Active' } })
    activeEncounter.status = 'Active'
    if (existingActive && existingActive._id !== id) {
      await Encounter.findByIdAndUpdate(existingActive._id, { $set: { status: 'Concluded' } })
    }
    activeEncounter._doc.request = {
      type: 'GET',
      url: endpoint + activeEncounter._id
    }
    res.json({
      status: {
        code: 200,
        message: 'Successfully updated/set Active Encounter'
      },
      activeEncounter
    })
} catch (err) {
  console.log(err)
  res.status(400).json({
    status: {
      code: 400,
      message: 'Error updating/setting Active Encounter'
    }
  })
}
}

const getEncounter = async (req, res, next) => {
  const id = req.params.encounterId
  try {
    const encounter = await Encounter.findById(id).select('-__v').exec()
    if (encounter) {
      res.status(200).json({
        status: {
          code: 200,
          message: 'Successfully fetched Encounter document'
        },
        encounter
      })
    } else {
      res.status(404).json({
        status: {
          code: 404,
          message: 'No Encounter document found for provided ID'
        }
      })
    }
  }
  catch (err) {
    res.status(400).json({
      status: {
        code: 400,
        message: 'Error getting Encounter document'
      }
    })
  }
}

const patchEncounter = async (req, res, next) => {
  try {
    const id = req.params.encounterId
    const updateOps = {}
    for (const ops of req.body) {
      updateOps[ops.propName] = ops.value
    }
    const changeActive = (updateOps.status === 'Active')
    if (changeActive) {
      const resetActives = await Encounter.updateMany({ status: 'Active' }, { $set: { status: 'Concluded' } }).exec()
    }
    const result = await Encounter.updateOne({ _id: id }, { $set: updateOps }).exec()
    if (result.n === 0) {
      res.status(500).json({
        status: {
          code: 500,
          message: 'Patch failed: Encounter document not found'
        }
      })
    } else {
      const add = {
        request: {
          type: 'GET',
          url: endpoint + id
        }
      }
      if (add) add.activeEncounter = id
      res.status(200).json({
        status: {
          code: 200,
          message: 'Successfully patched Encounter document'
        },
        ...result,
        ...{ _id: id },
        ...add
      })
    }
  }
  catch (err) {
    res.status(400).json({
      status: {
        code: 400,
        message: 'Error patching Encounter document'
      }
    })
  }
}

const deleteEncounter = async (req, res, next) => {
  try {
    const id = req.params.encounterId
    const result = await Encounter.deleteOne({ _id: id }).exec()
    res.status(200).json({
      status: {
        code: 200,
        message: 'Successfully deleted Encounter document'
      },
      ...result
    })
  }
  catch (err) {
    res.status(400).json({
      status: {
        code: 400,
        message: 'Error deleting Encounter document'
      }
    })
  }
}

const deleteAllEncounters = async (req, res, next) => {
  try {
    const result = await Encounter.remove().exec()
    res.status(200).json({
      status: {
        code: 200,
        message: 'Successfully deleted all Encounter documents'
      },
      ...result
    })
  }
  catch (err) {
    res.status(400).json({
      status: {
        code: 400,
        message: 'Error deleting all Encounter documents'
      }
    })
  }
}

module.exports = {
  createEncounter,
  getAllEncounters,
  setActiveEncounter,
  getEncounter,
  patchEncounter,
  deleteEncounter,
  deleteAllEncounters
}
