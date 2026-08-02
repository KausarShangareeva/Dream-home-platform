import mongoose from 'mongoose';

const debtSchema = new mongoose.Schema({
  creditor: { type: String, required: true },   // who the family owes
  amount: { type: Number, required: true },      // total owed
  paidAmount: { type: Number, default: 0 },      // how much has been paid back so far
  description: { type: String, default: '' },
  dueDate: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model('Debt', debtSchema);
