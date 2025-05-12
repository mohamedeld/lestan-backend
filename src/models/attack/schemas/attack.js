const { Schema, model, Types } = require("mongoose");
const { USER, QUIZ } = require("../../../constants/models-names.js");
const mongoosePaginate = require("mongoose-paginate-v2")

const attackSchema = new Schema(
  {
    type: { type: String, required: true },
    description: { type: String },
    video : { type: String},
    reportedBy: {
      type: Types.ObjectId,
      ref: USER,
      required: true
  },
  question:{
    type:Types.ObjectId,
    ref:QUIZ,
    required:true
  }
  },
  { timestamps: true }
);

attackSchema.plugin(mongoosePaginate)

module.exports = attackSchema;
