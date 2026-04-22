const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agence-immo';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error(' Erreur MongoDB:', err));

const contactSchema = new mongoose.Schema({
  civilite: { type: String, enum: ['Mme', 'M'], required: true },
  nom: { type: String, required: true, trim: true },
  prenom: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  telephone: { type: String, trim: true },
  typeMessage: { type: String, enum: ['visite', 'rappel', 'photos'], required: true },
  message: { type: String, trim: true },
  disponibilites: [{ jour: String, heure: Number, minutes: Number }],
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model('Contact', contactSchema);

app.post('/api/contact', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json({ success: true, message: 'Demande enregistrée avec succès', data: contact });
  } catch (err) {
    if (err.name === 'ValidationError')
      return res.status(400).json({ success: false, message: 'Données invalides', errors: err.errors });
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts, total: contacts.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Serveur sur http://localhost:${PORT}`));
