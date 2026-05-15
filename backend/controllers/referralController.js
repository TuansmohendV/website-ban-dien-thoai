import User from '../models/User.js';
import Referral from '../models/Referral.js';

export const getReferralStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const referrals = await Referral.find({ referrer: req.user._id });
    
    const stats = {
      referralCode: user.referralCode,
      totalInvited: referrals.length,
      pendingCount: referrals.filter(r => r.status === 'pending').length,
      completedCount: referrals.filter(r => r.status === 'completed').length,
      totalEarned: referrals
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + r.rewardAmount, 0),
    };

    res.json({ data: stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReferralHistory = async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user._id })
      .populate('referee', 'fullName email createdAt')
      .sort({ createdAt: -1 });

    res.json({ data: referrals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const applyReferralCode = async (req, res) => {
  const { referralCode } = req.body;
  
  try {
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(404).json({ message: 'Referral code invalid' });
    }

    if (referrer._id.equals(req.user._id)) {
      return res.status(400).json({ message: 'You cannot refer yourself' });
    }

    const user = await User.findById(req.user._id);
    if (user.referredBy) {
      return res.status(400).json({ message: 'You have already been referred' });
    }

    user.referredBy = referrer._id;
    await user.save();

    // Create a pending referral record
    const referral = new Referral({
      referrer: referrer._id,
      referee: user._id,
      status: 'pending',
    });
    await referral.save();

    res.json({ message: 'Referral code applied successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
