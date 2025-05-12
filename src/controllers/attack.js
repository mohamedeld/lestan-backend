const attackService = require('./../services/attack');
const asyncHandler = require('./../utils/async-handler');
const { OK, CREATED } = require('./../constants/status-codes');
const Attack = require("../models/attack")
const createAttack = asyncHandler(async (req, res) => {
    const { body, user } = req;
    const attack = await attackService.createAttack(body);
    res.status(CREATED).json(attack);
});

const getAttacks = asyncHandler(async (req, res) => {
    const attacks = await attackService.getAttacks(req.query);
    res.status(OK).json(attacks);
});

const getAttackById = asyncHandler(async (req, res) => {
    const attack = await attackService.getAttackById(req.params.id);
    res.status(OK).json(attack);
});

const updateAttack = asyncHandler(async (req, res) => {
    const attack = await attackService.updateAttack(req.params.id, req.body);
    res.status(OK).json(attack);
});

const deleteAttack = asyncHandler(async (req, res) => {
    await attackService.deleteAttack(req.params.id);
    res.status(OK).json({ message: 'Attack deleted successfully' });
});

const getAttackQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const attack = await Attack.findById(id).populate("question");
    if (!attack) {
      return res.status(404).json({ message: "Attack not found" });
    }

    return res.status(200).json({ question: attack.question });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
    createAttack,
    getAttacks,
    getAttackById,
    updateAttack,
    deleteAttack,
    getAttackQuestion
};
