// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer'); // Required for file uploads
const fs = require('fs');         // Required to create folders automatically

// Initialize the app
const app = express();
const port = process.env.PORT || 3000;

// --- 1. AUTO-CREATE UPLOADS FOLDER ---
// Checks if 'public/uploads' exists. If not, creates it to prevent errors.
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Created "public/uploads" folder for images.');
}

// --- 2. DATABASE CONNECTION ---
const dbURI = 'mongodb+srv://singh11jayant16_db_user:Cf9W4ex1dbFddu1k@cityjan.e5fmts3.mongodb.net/singh11jayant16_db_user?retryWrites=true&w=majority';

mongoose.connect(dbURI)
  .then((result) => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
  });

// --- 3. SCHEMAS & MODELS ---

// Report Schema
const reportSchema = new mongoose.Schema({
  problemType: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String },
  imagePath: { type: String }, 
  status: { type: String, default: 'Pending' },
  submittedAt: { type: Date, default: Date.now }
});
const Report = mongoose.model('Report', reportSchema);

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  identifier: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true } 
});
const User = mongoose.model('User', userSchema);


// --- 4. MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); 
  }
});
const upload = multer({ storage: storage });


// --- 5. MIDDLEWARE ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- 6. API ROUTES ---

// ROUTE A: Submit Report
app.post('/api/submit-report', upload.single('photo'), (req, res) => {
  console.log('Received new report submission');

  const newReport = new Report({
    problemType: req.body.problemType,
    location: req.body.location,
    description: req.body.description,
    imagePath: req.file ? '/uploads/' + req.file.filename : null 
  });

  newReport.save()
    .then((result) => {
      res.status(201).json({ 
        message: 'Report submitted successfully!', 
        reportId: result._id 
      });
    })
    .catch((err) => {
      console.error('Error saving report:', err);
      res.status(500).json({ error: 'Failed to submit report.' });
    });
});

// ROUTE B: Login
app.post('/api/login', async (req, res) => {
  const { identifier, password, role } = req.body;
  try {
    const user = await User.findOne({ identifier: identifier, role: role });
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.password !== password) return res.status(401).json({ success: false, message: 'Invalid Password/OTP.' });

    res.json({ 
      success: true, 
      message: 'Login Successful', 
      name: user.name,
      redirect: role === 'citizen' ? 'dashboard.html' : 'admin-dashboard.html'
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// ROUTE C: Setup Test Users
app.get('/api/setup-users', async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) return res.send("Users already exist. No need to setup.");

    const testUsers = [
      { name: "Jayant Singh", identifier: "9876543210", password: "1234", role: "citizen" },
      { name: "Officer Sharma", identifier: "admin", password: "admin123", role: "official" }
    ];
    
    await User.insertMany(testUsers);
    res.send("✅ Test Users Created! You can now login.");
  } catch (err) {
    res.send("Error: " + err.message);
  }
});

// ROUTE D: Get All Reports (*** THIS WAS MISSING ***)
// This allows the Admin Dashboard to fetch data from MongoDB
app.get('/api/reports', async (req, res) => {
  try {
    // Fetch all reports, sorted by newest first
    const reports = await Report.find().sort({ submittedAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// --- 7. CATCH-ALL ROUTE ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});