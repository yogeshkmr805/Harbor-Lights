const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const shifts = [
  { id: 1, day: 'Monday', slot: '3-5pm', capacity: 2, signedUp: [] },
  { id: 2, day: 'Wednesday', slot: '3-5pm', capacity: 2, signedUp: [] },
  { id: 3, day: 'Thursday', slot: '3-5pm', capacity: 2, signedUp: [] },
];

app.use(express.json());
app.use(express.static('views'));

app.get('/api/shifts', (req, res) => res.json(shifts));

app.post('/api/shifts/:id/signup', (req, res) => {
  const shift = shifts.find(s => s.id === Number(req.params.id));
  if (!shift) return res.status(404).json({ error: 'Shift not found' });
  if (shift.signedUp.length >= shift.capacity) {
    return res.status(409).json({ error: 'Shift is full' });
  }
  shift.signedUp.push(req.body.name);
  res.json(shift);
});

app.listen(PORT, () => console.log(`Shift signup running on port ${PORT}`));