const User = require('../models/User');
const { generateToken, formatUser } = require('../utils/helpers');
const { validateUserRegistration, validateUserLogin } = require('../utils/validators');
const Notification = require('../models/Notification');
const { Op } = require('sequelize');

// User Registration (with optional phone and OTP)
const register = async (req, res) => {
  try {
    const { username, email, password, fullName, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username },
          ...(phone ? [{ phone }] : [])
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
      }
      if (phone && existingUser.phone === phone) {
        return res.status(400).json({ success: false, message: 'Phone number already registered' });
      }
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      fullName,
      phone: phone || null
    });

    // If phone provided, send OTP
    if (phone) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      // TODO: Integrate with SMS service (Twilio, etc.)
      console.log(`OTP for ${phone}: ${otp}`);
      
      return res.status(201).json({
        success: true,
        message: 'User registered. Please verify your phone with the OTP sent.',
        data: {
          userId: user.id,
          phoneVerificationRequired: true
        }
      });
    }

    // Generate token
    const token = generateToken(user.id);
    const userData = formatUser(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// User Login (accepts email or username as identifier)
const login = async (req, res) => {
  try {
    const identifier = req.body.email || req.body.identifier || req.body.username;
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Email, username or phone number and password are required' });
    }

    // Try to find user by email, username, or phone (case-insensitive for username)
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { username: identifier },
          { phone: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email, username or password. Please try again.' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email, username or password. Please try again.' });
    }

    // Update last seen and save
    user.lastSeen = new Date();
    await user.save();

    // Generate token and respond
    const token = generateToken(user.id);
    const userData = formatUser(user);

    res.json({ success: true, message: 'Login successful', data: { user: userData, token } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: User, as: 'followers', attributes: ['username', 'fullName', 'profilePicture'] },
        { model: User, as: 'following', attributes: ['username', 'fullName', 'profilePicture'] }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = formatUser(user);

    res.json({
      success: true,
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { username, bio, fullName, isPrivate, website } = req.body;
    const userId = req.user.id;

    // Check if username is being changed and if it's already taken
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }
    }

    // Handle profile picture upload if provided
    let profilePicture = null;
    if (req.file) {
      // Check if Cloudinary credentials are properly configured
      const hasValidCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
          process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloudinary-cloud-name' &&
          process.env.CLOUDINARY_API_KEY && 
          process.env.CLOUDINARY_API_KEY !== 'your-cloudinary-api-key';

      if (hasValidCloudinary) {
        try {
          const cloudinary = require('cloudinary').v2;
          const streamifier = require('streamifier');
          
          // Upload to Cloudinary
          const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'instagram-clone/profile-pictures',
                transformation: [{ width: 500, height: 500, crop: 'fill' }]
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
          });
          
          profilePicture = uploadResult.secure_url;
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
          return res.status(400).json({
            success: false,
            message: 'Failed to upload profile picture. Please check your Cloudinary configuration.'
          });
        }
      } else {
        // Use a data URL as fallback when Cloudinary is not configured
        // In production, you should implement a local file storage solution
        console.warn('Cloudinary not configured. Using temporary image storage.');
        // For now, skip the profile picture update if Cloudinary is not configured
        // You can implement local storage here instead
      }
    }

    // Update user
    const updateData = {};
    if (username) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (fullName) updateData.fullName = fullName;
    if (website !== undefined) updateData.website = website;
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;
    if (profilePicture) updateData.profilePicture = profilePicture;

    await User.update(updateData, {
      where: { id: userId }
    });

    const user = await User.findByPk(userId, {
      include: [
        { model: User, as: 'followers', attributes: ['username', 'fullName', 'profilePicture'] },
        { model: User, as: 'following', attributes: ['username', 'fullName', 'profilePicture'] }
      ]
    });

    const userData = formatUser(user);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile'
    });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user.id;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const users = await User.findAll({
      where: {
        id: { [Op.ne]: currentUserId },
        [Op.or]: [
          { username: { [Op.like]: `%${query}%` } },
          { fullName: { [Op.like]: `%${query}%` } }
        ]
      },
      attributes: ['username', 'fullName', 'profilePicture', 'isVerified'],
      limit: 20
    });

    res.json({
      success: true,
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching users'
    });
  }
};

// Get notifications
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const notifications = await Notification.findAll({
      where: { recipientId: userId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      include: [
        { model: User, as: 'sender', attributes: ['username', 'profilePicture'] }
      ]
    });

    const unreadCount = await Notification.count({
      where: { recipientId: userId, isRead: false }
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching notifications'
    });
  }
};

// Mark notifications as read
const markNotificationsAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.user.id;

    await Notification.update({ isRead: true }, {
      where: {
        id: { [Op.in]: notificationIds },
        recipientId: userId
      }
    });

    res.json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    console.error('Mark notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking notifications as read'
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ success: false, message: 'User ID and OTP are required' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ success: false, message: 'No OTP found for this user' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Mark phone as verified
    user.phoneVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Generate token
    const token = generateToken(user.id);
    const userData = formatUser(user);

    res.json({
      success: true,
      message: 'Phone verified successfully',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying OTP' });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.phone) {
      return res.status(400).json({ success: false, message: 'No phone number associated with this user' });
    }

    if (user.phoneVerified) {
      return res.status(400).json({ success: false, message: 'Phone already verified' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // TODO: Integrate with SMS service
    console.log(`New OTP for ${user.phone}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error resending OTP' });
  }
};

// Logout (client-side mainly, but we can update last seen)
const logout = async (req, res) => {
  try {
    // Update last seen
    await User.update({ lastSeen: new Date() }, {
      where: { id: req.user.id }
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  searchUsers,
  getNotifications,
  markNotificationsAsRead,
  verifyOTP,
  resendOTP,
  logout
};