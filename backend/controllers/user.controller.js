import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET); 
}

// Login a user
const loginUser = async (req, res) => {

    try {
        
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please fill all the fields' });
        }   

        // Check if user exists 
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User does not exist' });
        }

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Create a token
        const token = createToken(user._id);
        res.status(200).json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }

};

// Register a new user
const registerUser = async (req, res) => {
    
    try {
        
        const { name, email,phone,password } = req.body;

        // Check if user already exists
        const exists = await User.findOne({email});
        if (exists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        //validating email format and strong password
        if(!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: 'Please enter a vlid email' });
        }
        // if(!validator.isStrongPassword(password)) {
        //     return res.status(400).json({ success: false, message: 'Please enter a strong password' });
        // }
        if(password.length < 5) {
            return res.status(400).json({ success: false, message: 'Password must be at least 5 characters long' });
        }

        if(!name || !email || !password || !phone) {
            return res.status(400).json({ success: false, message: 'Please fill all the fields' });
        }

        //hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            phone,
            password: hashedPassword
        });

        const user = await newUser.save();

        const token = createToken(user._id);
        res.status(201).json({ success: true, token });


    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }

};

// admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please fill all the fields' });
        }
        
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password, process.env.JWT_SECRET);
            res.status(200).json({ success: true, token });
        } else {
            res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const userDetails = async (req, res) => {
    try {
        const userId = req.userId; // Get userId from auth middleware
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { name, email, phone, currentPassword, newPassword } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // If changing password, verify current password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ success: false, message: 'Current password is required to set a new password' });
            }
            
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Current password is incorrect' });
            }

            if (newPassword.length < 5) {
                return res.status(400).json({ success: false, message: 'New password must be at least 5 characters long' });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Update other fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;

        await user.save();

        const updatedUser = await User.findById(userId).select('-password');
        res.status(200).json({ success: true, message: 'Profile updated successfully', user: updatedUser });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Upload profile photo
const uploadProfilePhoto = async (req, res) => {
    try {
        const userId = req.userId;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { profilePhoto } = req.body;
        
        if (!profilePhoto) {
            return res.status(400).json({ success: false, message: 'Profile photo is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.profilePhoto = profilePhoto;
        await user.save();

        const updatedUser = await User.findById(userId).select('-password');
        res.status(200).json({ success: true, message: 'Profile photo updated successfully', user: updatedUser });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export { loginUser, registerUser, adminLogin, userDetails, updateUserProfile, uploadProfilePhoto };
