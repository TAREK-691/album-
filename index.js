const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const videoFile = path.join(__dirname, "videos.json");
let videos = [];

// Load existing videos from JSON
try {
  videos = fs.readJsonSync(videoFile);
} catch {
  videos = [];
}

// ✅ Get full album list (categories + total videos)
app.get("/api/album/list", (req, res) => {
  const categories = {};
  videos.forEach(v => {
    const cat = v.category.toLowerCase();
    categories[cat] = (categories[cat] || 0) + 1;
  });
  res.json({ success: true, message: "Album list fetched successfully", categories });
});

// ✅ Get videos by category
app.get("/api/album/videos/:category", (req, res) => {
  const cat = req.params.category.toLowerCase();
  const filtered = videos.filter(v => v.category.toLowerCase() === cat);
  if (!filtered.length) {
    return res.json({ success: false, message: "No videos found in this category", videos: [] });
  }
  res.json({ success: true, message: "Videos fetched successfully", videos: filtered });
});

// ✅ Add video(s)
app.post("/api/album/add", (req, res) => {
  const { url, urls, category } = req.body;

  if (!category || (!url && !urls)) {
    return res.status(400).json({ success: false, error: "Category and url(s) required" });
  }

  if (urls && Array.isArray(urls)) {
    urls.forEach(u => videos.push({ url: u, category }));
  } else if (url) {
    videos.push({ url, category });
  }

  fs.writeJsonSync(videoFile, videos, { spaces: 2 });

  res.json({ success: true, message: `Video(s) added to ${category}`, videos });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
