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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft fehlerfrei auf Port ${PORT}`);
})
