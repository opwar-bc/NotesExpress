const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3001;
const { v4: uuidv4 } = require("uuid");

const NOTES_DB = "./db/db.json";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const readNotes = async () => {
  const data = await fs.readFile(NOTES_DB, "utf8");
  return JSON.parse(data);
};

const writeNotes = async (notes) => {
  await fs.writeFile(NOTES_DB, JSON.stringify(notes));
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/notes.html"));
});

app.get("/api/notes", async (req, res) => {
  try {
    const notes = await readNotes();
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error reading notes" });
  }
});

app.post("/api/notes", async (req, res) => {
  try {
    const notes = await readNotes();
    const newNote = { ...req.body, id: uuidv4() };
    notes.push(newNote);
    await writeNotes(notes);
    res.json(newNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error saving the note" });
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  try {
    let notes = await readNotes();

    // Filter out the note with the id from the URL
    notes = notes.filter((note) => note.id !== req.params.id);

    // Write the filtered notes back to the file
    await writeNotes(notes);

    // Send a successful response
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting the note" });
  }
});

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
