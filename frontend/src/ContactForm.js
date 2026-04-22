import React, { useState } from 'react';
import './ContactForm.css';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const HEURES = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

const initialForm = { civilite: '', nom: '', prenom: '', email: '', telephone: '', typeMessage: '', message: '' };
const initialDispo = { jour: 'Lundi', heure: 7, minutes: 0 };

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [dispo, setDispo] = useState(initialDispo);
  const [dispos, setDispos] = useState([]);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.civilite) e.civilite = 'Requis';
    if (!form.nom.trim()) e.nom = 'Requis';
    if (!form.prenom.trim()) e.prenom = 'Requis';
    if (!form.email.trim()) e.email = 'Requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide';
    if (!form.typeMessage) e.typeMessage = 'Requis';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(err => ({ ...err, [name]: undefined }));
  };

  const handleDispoChange = (e) => {
    const { name, value } = e.target;
    setDispo(d => ({ ...d, [name]: name === 'jour' ? value : Number(value) }));
  };

  const addDispo = () => setDispos(prev => [...prev, { ...dispo }]);
  const removeDispo = (idx) => setDispos(prev => prev.filter((_, i) => i !== idx));
  const formatDispo = (d) => `${d.jour} à ${String(d.heure).padStart(2,'0')}h${String(d.minutes).padStart(2,'0')}`;

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true); setStatus(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, disponibilites: dispos }),
      });
      const data = await res.json();
      if (data.success) { setStatus('success'); setForm(initialForm); setDispos([]); }
      else setStatus('error');
    } catch { setStatus('error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="form-wrapper">
      <div className="form-card">
        <div className="bg-overlay" />
        <div className="form-content">
          <h1 className="form-title">CONTACTEZ L'AGENCE</h1>
          <div className="form-grid">
            {/* LEFT */}
            <div className="col-left">
              <h2 className="section-title">VOS COORDONNÉES</h2>
              <div className="radio-group">
                {['Mme', 'M'].map(c => (
                  <label key={c} className={`radio-label ${errors.civilite ? 'error-label' : ''}`}>
                    <input type="radio" name="civilite" value={c} checked={form.civilite === c} onChange={handleChange} />
                    <span className="radio-custom" />{c}
                  </label>
                ))}
                {errors.civilite && <span className="field-error">{errors.civilite}</span>}
              </div>
              <div className="input-row">
                <div className="input-wrap">
                  <input className={`field ${errors.nom ? 'field-err' : ''}`} type="text" name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} />
                  {errors.nom && <span className="field-error">{errors.nom}</span>}
                </div>
                <div className="input-wrap">
                  <input className={`field ${errors.prenom ? 'field-err' : ''}`} type="text" name="prenom" placeholder="Prénom" value={form.prenom} onChange={handleChange} />
                  {errors.prenom && <span className="field-error">{errors.prenom}</span>}
                </div>
              </div>
              <div className="input-wrap">
                <input className={`field ${errors.email ? 'field-err' : ''}`} type="email" name="email" placeholder="Adresse mail" value={form.email} onChange={handleChange} />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <input className="field" type="tel" name="telephone" placeholder="Téléphone" value={form.telephone} onChange={handleChange} />

              <h2 className="section-title dispo-title">DISPONIBILITÉS POUR UNE VISITE</h2>
              <div className="dispo-row">
                <select className="dispo-select" name="jour" value={dispo.jour} onChange={handleDispoChange}>
                  {JOURS.map(j => <option key={j}>{j}</option>)}
                </select>
                <select className="dispo-select dispo-small" name="heure" value={dispo.heure} onChange={handleDispoChange}>
                  {HEURES.map(h => <option key={h} value={h}>{h}h</option>)}
                </select>
                <select className="dispo-select dispo-small" name="minutes" value={dispo.minutes} onChange={handleDispoChange}>
                  {MINUTES.map(m => <option key={m} value={m}>{m}m</option>)}
                </select>
                <button className="btn-add" onClick={addDispo} type="button">AJOUTER<br />DISPO</button>
              </div>
              <div className="dispo-list">
                {dispos.map((d, i) => (
                  <span key={i} className="dispo-tag">
                    {formatDispo(d)}
                    <button className="dispo-remove" onClick={() => removeDispo(i)} type="button">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div className="col-right">
              <h2 className="section-title">VOTRE MESSAGE</h2>
              <div className="radio-group radio-group-msg">
                {[{value:'visite',label:'Demande de visite'},{value:'rappel',label:'Être rappelé·e'},{value:'photos',label:'Plus de photos'}].map(({value,label}) => (
                  <label key={value} className={`radio-label ${errors.typeMessage ? 'error-label' : ''}`}>
                    <input type="radio" name="typeMessage" value={value} checked={form.typeMessage === value} onChange={handleChange} />
                    <span className="radio-custom" />{label}
                  </label>
                ))}
              </div>
              {errors.typeMessage && <span className="field-error">{errors.typeMessage}</span>}
              <textarea className="field textarea" name="message" placeholder="Votre message" value={form.message} onChange={handleChange} />
              <div className="submit-row">
                <button className="btn-submit" onClick={handleSubmit} disabled={loading} type="button">
                  {loading ? 'ENVOI...' : 'ENVOYER'}
                </button>
              </div>
              {status === 'success' && <div className="alert alert-success">✓ Demande envoyée avec succès !</div>}
              {status === 'error' && <div className="alert alert-error">✗ Une erreur est survenue. Réessayez.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
