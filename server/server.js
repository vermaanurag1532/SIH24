const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const https = require("https"); // Import HTTPS module
const { Server } = require("socket.io");
require("dotenv").config();
require("./db/conn");
require("./controllers/socket");
const userRouter = require("./routes/userRoutes");
const doctorRouter = require("./routes/doctorRoutes");
const appointRouter = require("./routes/appointRoutes");
const notificationRouter = require("./routes/notificationRouter");

const app = express();
const port = process.env.PORT || 5015;

// Use CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Define routes
app.use("/api/user", userRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/appointment", appointRouter);
app.use("/api/notification", notificationRouter);

// Serve static files from the React client build directory
app.use(express.static(path.join(__dirname, "./client/build")));

// Catch-all route to serve the frontend's index.html
app.get("*", (req, res) => {
  res.send("<h1>Hello</h1>");
});

// Path to SSL certificate and private key files
const privateKey = fs.readFileSync('/etc/letsencrypt/live/redlinear.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/redlinear.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/redlinear.com/chain.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate, ca: ca };

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Start the HTTPS server
httpsServer.listen(443, () => {
  console.log("HTTPS Server running on port 443");
});

// Optionally, add an HTTP server to redirect HTTP to HTTPS
const http = require("http");
const httpServer = http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
});

// Listen on port 80 for HTTP requests and redirect them to HTTPS
httpServer.listen(80, () => {
  console.log("HTTP Server running on port 80 and redirecting to HTTPS");
});
