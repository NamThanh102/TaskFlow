import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên dự án là bắt buộc'],
      trim: true,
      maxlength: [100, 'Tên dự án tối đa 100 ký tự'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Mô tả tối đa 500 ký tự'],
    },
    color: {
      type: String,
      default: '#4f46e5', // Màu chủ đạo (Indigo)
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt, updatedAt
  }
);

// Compound index for listing projects by user sorted by creation time
projectSchema.index({ user: 1, createdAt: -1 });

// Cascade deletion hook: automatically delete all associated tasks when a project document is deleted
projectSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    await mongoose.model('Task').deleteMany({ project: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
