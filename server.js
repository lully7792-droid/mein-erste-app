require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Statische HTML-Dateien aus dem aktuellen Ordner bereitstellen
app.use(express.static(__dirname));

// ==========================================
// ROUTE 1: KI-EXPOSÉ-GENERATOR
// ==========================================
app.post('/api/generate-expose', async (req, res) => {
    const { title, price, location, year, energy, notes, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Du bist ein professioneller Immobilienmakler. Schreibe ein ansprechendes, verkaufsstarkes Exposé auf Deutsch basierend auf den bereitgestellten Objektdaten." },
                { role: "user", content: `Titel: ${title}, Lage/Ort: ${location || "Nicht angegeben"}, Preis: ${price} EUR, Baujahr: ${year}, Energieausweis: ${energy}, Notizen: ${notes}` }
            ]
        });

        const exposeText = response.choices[0].message.content;
        res.json({ success: true, text: exposeText });
    } catch (error) {
        console.error("Exposé-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler bei der KI-Generierung" });
    }
});

// ==========================================
// ROUTE 2: KI-BILDANALYSE
// ==========================================
app.post('/api/analyze-image', async (req, res) => {
    const { image, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Du bist ein erfahrener Immobilienmakler. Analysiere das Bild und extrahiere Highlights." },
                { role: "user", content: [{ type: "text", text: "Analysiere dieses Bild:" }, { type: "image_url", image_url: { "url": image } }] }
            ]
        });

        const analysisText = response.choices[0].message.content;
        res.json({ success: true, analysis: analysisText });
    } catch (error) {
        console.error("Bildanalyse-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler bei der KI-Analyse" });
    }
});

// ==========================================
// ROUTE 3: KI-MAIL-GENERATOR
// ==========================================
app.post('/api/generate-mail', async (req, res) => {
    const { query, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Du bist ein professioneller Immobilienmakler. Schreibe eine Antwort-E-Mail auf Deutsch. Generiere ganz oben 3 packende Betreffzeilen. Trenne die Betreffzeilen und die E-Mail strikt mit dem Wort '===TRENNUNG==='." },
                { role: "user", content: `Anfrage: ${query}` }
            ]
        });

        const gesamtText = response.choices[0].message.content;
        let betreffText = "1. Ihre Anfrage\n2. Rückmeldung\n3. Details zu Ihrer Nachricht";
        let mailText = gesamtText;

        if (gesamtText.includes('===TRENNUNG===')) {
            const teile = gesamtText.split('===TRENNUNG===');
            betreffText = teile[0].trim();
            mailText = teile[1].trim();
        }

        res.json({ success: true, subjects: betreffText, mail: mailText });
    } catch (error) {
        console.error("Mail-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler bei der KI-Generierung" });
    }
});

// ==========================================
// ROUTE 4: KI-SOCIAL-MEDIA-GENERATOR
// ==========================================
app.post('/api/generate-social', async (req, res) => {
    const { title, price, location, notes, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Du bist ein Social-Media-Manager für Immobilien. Generiere einen Post für Instagram und einen für LinkedIn. Trenne die Posts strikt mit dem Wort '===TRENNUNG==='." },
                { role: "user", content: `Objekt: ${title}, Ort: ${location}, Preis: ${price}, Details: ${notes}` }
            ]
        });

        const gesamtText = response.choices[0].message.content;
        let instaPost = gesamtText;
        let linkedinPost = gesamtText;

        if (gesamtText.includes('===TRENNUNG===')) {
            const teile = gesamtText.split('===TRENNUNG===');
            instaPost = teile[0].trim();
            linkedinPost = teile[1].trim();
        }

        res.json({ success: true, instagram: instaPost, linkedin: linkedinPost });
    } catch (error) {
        console.error("Social-Media-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler bei der Generierung" });
    }
});

// ==========================================
// ROUTE 5: KI-IMMOBILIEN-WERTRECHNER
// ==========================================
app.post('/api/generate-valuation', async (req, res) => {
    const { size, rooms, condition, location, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Du bist ein zertifizierter Immobiliengutachter. Berechne eine realistische, professionelle Marktwert-Einschätzung (Spanne von-bis) auf Deutsch basierend auf den Daten. Begründe den Wert detailliert anhand von Lage, Zustand, Zimmeranzahl und Wohnfläche." },
                { role: "user", content: `Wohnfläche: ${size} qm, Zimmer: ${rooms}, Zustand: ${condition}, Lage/Ort: ${location}` }
            ]
        });
        res.json({ success: true, text: response.choices[0].message.content });
    } catch (error) {
        console.error("Wertrechner-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler bei der Wertermittlung" });
    }
});

// ==========================================
// ROUTE 6: KI-OBJEKT-CHECKLISTE
// ==========================================
app.post('/api/generate-checklist', async (req, res) => {
    const { type, year, condition, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Du bist ein extrem strukturierter Immobilienmakler. Generiere eine maßgeschneiderte, glasklare To-Do-Checkliste auf Deutsch für den Verkaufsprozess dieses Objekts. Unterteile in: 1. Dokumentenbeschaffung, 2. Vorbereitung & Sanierung, 3. Vermarktung & Besichtigung." },
                { role: "user", content: `Objekttyp: ${type}, Baujahr: ${year}, Zustand: ${condition}` }
            ]
        });
        res.json({ success: true, text: response.choices[0].message.content });
    } catch (error) {
        console.error("Checklisten-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler bei der Checklisten-Erstellung" });
    }
});

// ==========================================
// ROUTE 7: KI-LAGE-BESCHREIBER
// ==========================================
app.post('/api/generate-location', async (req, res) => {
    const { location, targetGroup, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Du bist ein lokaler Immobilienexperte. Schreibe eine packende, emotionale Lage- und Infrastrukturbeschreibung auf Deutsch für ein Exposé. Hebe die Anbindung, Einkaufsmöglichkeiten, Schulen und den Freizeitwert hervor, maßgeschneidert auf die genannte Zielgruppe." },
                { role: "user", content: `Ort/Stadtteil: ${location}, Zielgruppe: ${targetGroup}` }
            ]
        });
        res.json({ success: true, text: response.choices[0].message.content });
    } catch (error) {
        console.error("Lagebeschreiber-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler bei der Lageanalyse" });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft fehlerfrei auf Port ${PORT}`);
})
