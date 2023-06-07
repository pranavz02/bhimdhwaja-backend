import express from 'express'
const router = express.Router()
import {
  authViaPassword,
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  verifyUser,
  findUser,
  updatePassword,
  resendOTP,
} from '../controllers/userController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router.route('/').post(registerUser).get(protect, admin, getUsers)
router.post('/login', authUser)
router.post('/loginviapassword', authViaPassword)
router.post('/verifyotp', verifyUser)
router.post('/finduser', findUser)
router.post('/updatepassword', updatePassword)
router.post('/resendOTP', resendOTP)
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)

export default router
