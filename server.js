const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

const metadataFile = path.join(__dirname, "uploads", "metadata.json");

app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Load metadata from file
function loadMetadata() {
  if (fs.existsSync(metadataFile)) {
    const data = fs.readFileSync(metadataFile);
    return JSON.parse(data);
  }
  return {};
}

// Save metadata to file
function saveMetadata(metadata) {
  fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
}

// Handle file upload
app.post("/upload", upload.single("fileUpload"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  const metadata = loadMetadata();
  metadata[req.file.filename] = {
    originalName: req.file.originalname,
    timestamp: new Date().toISOString(),
  };
  saveMetadata(metadata);

  res.json({ success: true, message: "File uploaded successfully" });
});

// List files
app.get("/files", (req, res) => {
  fs.readdir("uploads/", (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to list files" });
    }

    const metadata = loadMetadata();
    const filteredFiles = files.filter((file) => file !== "metadata.json");
    const fileList = filteredFiles.map((file) => ({
      name: file,
      originalName: metadata[file]?.originalName,
      timestamp: metadata[file]?.timestamp,
    }));

    res.json(fileList);
  });
});

// Delete file
app.delete("/delete", (req, res) => {
  const fileName = req.query.fileName;
  if (!fileName) {
    return res
      .status(400)
      .json({ success: false, message: "No file specified" });
  }

  const filePath = path.join("uploads", fileName);
  fs.unlink(filePath, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete file" });
    }

    const metadata = loadMetadata();
    delete metadata[fileName];
    saveMetadata(metadata);

    res.json({ success: true, message: "File deleted successfully" });
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
const HOST = "127.0.0.1";

app.listen(PORT, HOST, () => {
  console.log(`Server started on http://${HOST}:${PORT}`);
});
