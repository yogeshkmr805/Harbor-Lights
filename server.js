const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DEFAULT_SHIFTS = [
  { id: 1, day: 'Monday', slot: '3-5pm', capacity: 2, signedUp: [] },
  { id: 2, day: 'Wednesday', slot: '3-5pm', capacity: 2, signedUp: [] },
  { id: 3, day: 'Thursday', slot: '3-5pm', capacity: 2, signedUp: [] },
];

function getDataFilePath() {
  const containerPath = path.join('/', 'app', 'data', 'shifts.json');
  if (fs.existsSync('/app')) {
    return containerPath;
  }

  return path.join(__dirname, 'app', 'data', 'shifts.json');
}

function readShiftsFromDisk() {
  const filePath = getDataFilePath();

  if (!fs.existsSync(filePath)) {
    return JSON.parse(JSON.stringify(DEFAULT_SHIFTS));
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : JSON.parse(JSON.stringify(DEFAULT_SHIFTS));
  } catch (error) {
    return JSON.parse(JSON.stringify(DEFAULT_SHIFTS));
  }
}

function saveShiftsToDisk() {
  const filePath = getDataFilePath();
  const dataDir = path.dirname(filePath);

  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(shifts, null, 2));
}

let shifts = readShiftsFromDisk();

app.use(express.json());
app.use(express.static('views'));

app.get('/api/shifts', (req, res) => res.json(shifts));

app.post('/api/shifts/:id/signup', (req, res) => {
  const shift = shifts.find(s => s.id === Number(req.params.id));
  if (!shift) return res.status(404).json({ error: 'Shift not found' });

  const name = String(req.body.name || '').trim();
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (shift.signedUp.length >= shift.capacity) {
    return res.status(409).json({ error: 'Shift is full' });
  }

  shift.signedUp.push(name);
  saveShiftsToDisk();

  res.json(shifts);
});

app.listen(PORT, () => console.log(`Shift signup running on port ${PORT}`));