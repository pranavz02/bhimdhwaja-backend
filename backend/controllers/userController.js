import asyncHandler from 'express-async-handler'
import generateToken from '../utils/generateToken.js'
import User from '../models/userModel.js'
import otpGenerator from 'otp-generator'
import Sendotp from '../utils/sendOtp.js'

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public

const generateOTP = async (phone) => {
  const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
  const phoneString = '91' + phone
  const sendOtp = new Sendotp(process.env.AUTH_KEY)

  sendOtp.send(phoneString, process.env.SENDER_ID, process.env.DLT_TE_ID, otp)
  return otp
}

const authViaPassword = asyncHandler(async (req, res) => {
  const { phone, password } = req.body
  const regx = /^[6-9]\d{9}$/;
  if (!regx.test(phone)) {
    return res.status(400).json({ message: 'Enter a valid phone number' })
  }
  const user = await User.findOne({ phone })
  if (!user)
    return res.status(401).json({ message: 'New to Bhimdhwaja? Click on Register' })

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      })
    } else {
      res.status(401).json({message: 'Invalid password'})
    }
})

const authUser = asyncHandler(async (req, res) => {
  const { phone } = req.body
  const regx = /^[6-9]\d{9}$/;
  if (!regx.test(phone)) {
    return res.status(400).json({ message: 'Enter a valid phone number' })
  }
  const user = await User.findOne({ phone })

  if (!user)
    return res.status(401).json({ message: 'New to Bhimdhwaja? Click on Register' })
  
  const otp = await generateOTP(phone)
  // console.log(otp)
  await User.updateOne({ _id: user._id }, { otp: otp });

  // if (!user.verifiedUser) return res.status(400).json({ message: "User not verified" })

  res.json(user.authObj());
})

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body
  const regx = /^[6-9]\d{9}$/;
  if (!regx.test(phone)) {
    return res.status(400).json({ message: 'Enter a valid phone number' })
  }

  const phoneUserExists = await User.findOne({ phone })
  if (phoneUserExists) {
    return res.status(400).json({ message: 'User already exists' })
  }
  if (email) {
    const userExists = await User.findOne({ email })
    if (userExists) {
      res.status(400).json({ message: 'User already exists' })
    }
  }
  const otp = await generateOTP(phone)
  // console.log({
  //   name,
  //   email,
  //   phone,
  //   password,
  //   otp
  // })
  const user = await User.create({
    name,
    email,
    phone,
    password,
    otp,
    // verifiedUser: false
  })
  if (!user)
    return res.status(400).json({ message: 'Invalid user data' })

  res.status(201).json({ message: "registered successfully" })
})

const verifyUser = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  const user = await User.findOne({ phone })

  if (!user) return res.status(401).json({ message: "User not found" })
  // if (user.verifiedUser) return res.status(400).json({ message: "user already verified" });

  if (otp != user.otp)
    return res.status(400).json({ message: 'Invalid OTP' })

  // await User.updateOne({ _id: user._id }, { verifiedUser: true });
  res.status(201).json(user.authObj())
})

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user)
    return res.status(404).json({ message: 'User not found' })

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: user.isAdmin,
  })
})

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.phone = req.body.phone || user.phone
    if (req.body.password) {
      user.password = req.body.password
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    })
  } else {
    return res.status(404).json({ message: 'User not found' })
  }
})

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
  res.json(users)
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    await user.remove()
    res.json({ message: 'User removed' })
  } else {
    return res.status(404).json({ message: 'User not found' })
  }
})

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')

  if (user) {
    res.json(user)
  } else {
    return res.status(404).json({ message: 'User not found' })
  }
})

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.phone = req.body.phone || user.phone
    user.isAdmin = req.body.isAdmin

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      isAdmin: updatedUser.isAdmin,
    })
  } else {
    return res.status(404).json({ message: 'User not found' })
  }
})

const findUser = asyncHandler(async (req, res) => {
  const { phone } = req.body

  const regx = /^[6-9]\d{9}$/;
  if (!regx.test(phone)) {
    return res.status(400).json({ message: 'Enter a valid phone number' })
  }
  const user = await User.findOne({ phone })

  if (user) {
    const otp = await generateOTP(phone)
    // console.log(otp)
    await user.updateOne({
      otp: otp,
      // verifiedUser: false
    })
    res.json({
      phone: phone,
      otp: otp
    })
  } else {
    return res.status(404).json({ message: 'User not found' })
  }
})

const resendOTP = asyncHandler(async (req, res) => {
  const { phone } = req.body

  const regx = /^[6-9]\d{9}$/;
  if (!regx.test(phone)) {
    return res.status(400).json({ message: 'Phone number invalid' })
  }
  const user = await User.findOne({ phone })

  if (user) {
    const otp = await generateOTP(phone)
    await user.updateOne({
      otp: otp,
      // verifiedUser: false
    })
    res.json({
      phone: phone,
      otp: otp,
      message: 'OTP sent successfully'
    })
  } else {
    return res.status(404).json({ message: 'User not found' })
  }
})

const updatePassword = asyncHandler(async (req, res) => {
  const { phone, password } = req.body
  const user = await User.findOne({ phone })

  if (user) {
    user.password = password

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    })
  } else {
    return res.status(404).json({ message: 'User not found' })
  }
})

export {
  authViaPassword,
  authUser,
  registerUser,
  verifyUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  findUser,
  updatePassword,
  resendOTP
}
