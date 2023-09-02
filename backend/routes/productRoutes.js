import express from 'express'
import upload from '../utils/multer.js'
import {v2 as cloudinary} from 'cloudinary'
const router = express.Router()
import {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
} from '../controllers/productController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router.route('/').get(getProducts).post(protect, admin, createProduct)
router.route('/:id/reviews').post(protect, createProductReview)
router.get('/top', getTopProducts)
router
  .route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct)
router.post('/upload/:id', upload.single('image'), async (req, res) => {
  try {
    const path = req.file.path;
    const images = await cloudinary.uploader.upload(path, {folder: 'products', resource_type: "image", public_id: req.params.id})
    res.status(200).json({image_url: images.secure_url})
  } catch (error) {
    
    console.log(error)
    res.status(400).json(error)
  }
})
export default router
