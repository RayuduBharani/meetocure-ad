const express = require('express');
const cors = require('cors');
const connectDB = require('./DB');
const Admin = require('./models/admin');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());



app.get('/', (req, res) => {
	res.send('Welcome to the Admin API');
});

// admin login route
// admin login route
app.post("/admin/login", async (req, res) => {
    try {
        await connectDB();
        const { email, password } = req.body;
        
        // Find user by email
        const user = await Admin.findOne({ email });
        
        // If user doesn't exist
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please register first."
            });
        }
        
        // Check if user is active
        if (user.status !== 'Active') {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive. Please contact administrator."
            });
        }
        
        // Check password
        if (user.password !== password) { // Note: In production, use proper password hashing
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }
        
        // Login successful
        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// admin register route
app.post("/admin/register", async (req, res) => {
    connectDB()
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).send({ success: false, message: "Email and password are required" })
    }
    const existing = await Admin.findOne({ email })
    if (existing) {
        return res.status(409).send({ success: false, message: "User already registered" })
    }
    const created = await Admin.create({
        email,
        password,
        role: "Admin",
        name: email.split('@')[0] // Using email prefix as default name
    })
    if (created) {
        return res.status(201).send({ success: true, message: "Registration success" })
    }
    return res.status(500).send({ success: false, message: "Could not register user" })
})

//doctor routes
app.use("/admin/doctors", require("./routes/doctors.js"));
app.use("/admin/hospitals", require("./routes/hospitals.js"));

//patient routes
app.use("/admin/patients", require("./routes/patients.js"));

//appointment routes
app.use("/admin/appointments", require("./routes/appointments.js"));

//settings routes
app.use("/admin/settings", require("./routes/settings.js"));

//admin routes
app.use("/admin/users", require("./routes/admin.js"));

//stats routes
app.use("/admin/stats", require("./routes/stats.js"));


// Connect to MongoDB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
