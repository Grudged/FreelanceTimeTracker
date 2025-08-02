const { User } = require('../models');
const { generateToken } = require('../middleware/auth');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      // Validation
      if (!username || !email || !password) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Username, email, and password are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: 'Invalid password',
          message: 'Password must be at least 6 characters long'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(409).json({
          error: 'User already exists',
          message: 'A user with this email or username already exists'
        });
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        firstName,
        lastName
      });

      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        message: 'User registered successfully',
        user,
        token
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Registration failed',
        message: 'Unable to register user'
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          error: 'Missing credentials',
          message: 'Username and password are required'
        });
      }

      // Find user by username or email
      const user = await User.findOne({
        $or: [{ username }, { email: username }],
        isActive: true
      });

      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Invalid username/email or password'
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Invalid username/email or password'
        });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        message: 'Login successful',
        user,
        token
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Login failed',
        message: 'Unable to authenticate user'
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      res.json({
        message: 'Profile retrieved successfully',
        user: req.user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Failed to get profile',
        message: 'Unable to retrieve user profile'
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const { firstName, lastName, email } = req.body;
      const userId = req.user._id;

      // Check if email is being changed and if it's already in use
      if (email && email !== req.user.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
          return res.status(409).json({
            error: 'Email already in use',
            message: 'Another user is already using this email address'
          });
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { firstName, lastName, email },
        { new: true, runValidators: true }
      );

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Failed to update profile',
        message: 'Unable to update user profile'
      });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: 'Missing passwords',
          message: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error: 'Invalid password',
          message: 'New password must be at least 6 characters long'
        });
      }

      const user = await User.findById(req.user._id);
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);

      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          error: 'Invalid current password',
          message: 'The current password you entered is incorrect'
        });
      }

      user.password = newPassword;
      await user.save();

      res.json({
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        error: 'Failed to change password',
        message: 'Unable to change password'
      });
    }
  }
}

module.exports = AuthController;
