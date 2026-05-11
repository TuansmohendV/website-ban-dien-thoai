import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      default: 'Khach hang',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    dateOfBirth: Date,
    authProvider: {
      type: String,
      enum: ['local', 'google', 'facebook', 'firebase', 'email_otp'],
      default: 'local',
    },
    firebaseUid: {
      type: String,
      sparse: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ['customer', 'staff', 'manager', 'admin'],
      default: 'customer',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: Date,
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpiresAt: {
      type: Date,
      select: false,
    },
    linkedAccounts: {
      banks: [{
        bankId: String,
        accountNumber: String,
        accountName: String,
        idNumber: String,
        phone: String,
        issueDate: String,
        branch: String,
        createdAt: { type: Date, default: Date.now }
      }],
      wallets: [{
        walletId: String,
        phone: String,
        accountName: String,
        createdAt: { type: Date, default: Date.now }
      }]
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpiresAt;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function savePassword() {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
