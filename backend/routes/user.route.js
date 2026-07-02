import express from 'express';
import { registerUser, loginUser, adminLogin, userDetails, updateUserProfile, uploadProfilePhoto } from '../controllers/user.controller.js';
import authUser from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);
userRouter.post('/profile', authUser, userDetails);
userRouter.put('/profile', authUser, updateUserProfile);
userRouter.post('/profile/photo', authUser, uploadProfilePhoto);

export default userRouter;
