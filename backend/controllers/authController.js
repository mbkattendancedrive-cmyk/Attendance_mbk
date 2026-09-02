import Admin from '../models/Admin.js';
import Employee from '../models/Employee.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user (admin or employee) & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // First check if it's an admin
    let user = await Admin.findOne({ email });
    
    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }

    // Then check if it's an employee (by email or employeeId)
    user = await Employee.findOne({
      $or: [
        { email: email.toLowerCase() },
        { employeeId: email.toUpperCase() },
        { email: email }
      ]
    });
    
    if (user && (await user.matchPassword(password))) {
      // Check status
      if (user.status === 'Inactive') {
        return res.status(401).json({ message: 'Account is inactive. Please contact admin.' });
      }

      return res.json({
        _id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        totalPoints: user.totalPoints,
        token: generateToken(user._id),
      });
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
