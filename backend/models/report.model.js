import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    userInputs: {
      type: Object,
      default: {},
    },


    footprint_kg_per_year: {
      type: Number,
      required: true,
    },

    breakdown: {
      type: Object,
      default: {},
    },

    risk_level: {
      type: String,
      required: true,
    },

    benchmark_value_kg_per_year: {
      type: Number,
      required: true,
    },

    ai_plan: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;

