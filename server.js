const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// OpenAI API-Verbindung aufbauen
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

    if (password !== "makler-erfolg") {
        return res.status(401).json({ success: false, error: "Nicht autorisiert" });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: "Du bist ein professioneller Immobilienmakler. Schreibe ein ansprechendes, verkaufsstarkes Exposé auf Deutsch basierend auf den bereitgestellten Objektdaten." 
                },
                { role: "user", content: `Titel: ${title}, Lage/Ort: ${location || "Nicht angegeben"}, Preis: ${price} EUR, Baujahr: ${year}, Energieausweis: ${energy}, Notizen: ${notes}` }
            ]
        });

        const exposeText = response.choices.message.content;
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

    if (password !== "makler-erfolg") {
        return res.status(401).json({ success: false, error: "Nicht autorisiert" });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "Du bist ein erfahrener Immobilienmakler. Analysiere das hochgeladene Bild eines Hauses oder Raumes und extrahiere die wichtigsten, verkaufsstärksten Highlights für ein Exposé."
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analysiere dieses Immobilienbild und nenne Highlights:" },
                        { type: "image_url", image_url: { "url": image } }
                    ]
                }
            ]
        });

        const analysisText = response.choices.message.content;
        res.json({ success: true, analysis: analysisText });

    } catch (error) {
        console.error("Fehler bei Bildanalyse:", error);
        res.status(500).json({ success: false, error: "Fehler bei der KI-Analyse" });
    }
});

// ==========================================
// ROUTE 3: KI-MAIL-GENERATOR
// ==========================================
app.post('/api/generate-mail', async (req, res) => {
    const { query, password } = req.body;

    if (password !== "makler-erfolg") {
        return res.status(401).json({ success: false, error: "Nicht autorisiert" });
    }

    if (!query) {
        return res.status(400).json({ success: false, error: "Keine Anfrage angegeben" });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: "Du bist ein professioneller Immobilienmakler. Schreibe eine höfliche, kundenorientierte Antwort-E-Mail auf Deutsch basierend auf der Kundenanfrage." 
                },
                { role: "user", content: `Hier ist die Kundenanfrage: ${query}` }
            ]
        });

        const mailText = response.choices.message.content;
        res.json({ success: true, mail: mailText });

    } catch (error) {
        console.error("Fehler beim Mail-Generator:", error);
        res.status(500).json({ success: false, error: "Fehler bei der KI-Generierung" });
    }
});

// ==========================================
// ROUTE 4: KI-SOCIAL-MEDIA-GENERATOR
// ==========================================
app.post('/api/generate-social', async (req, res) => {
    const { title, price, location, notes, password } = req.body;

    if (password !== "makler-erfolg") {
        return res.status(401).json({ success: false, error: "Nicht autorisiert" });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: "Du bist ein genialer Social-Media-Manager für Immobilien. Generiere zwei separate Posts auf Deutsch basierend auf den Objektdaten. Trenne die Posts strikt mit dem Wort '===TRENNUNG==='. Post 1 ist für Instagram (emotional, mit passenden Emojis und Immobilien-Hashtags). Post 2 ist für LinkedIn (professionell, B2B-orientiert, Fokus auf Investment und Fakten)." 
                },
                { role: "user", content: `Objekt: ${title}, Lage/Ort: ${location || "Nicht angegeben"}, Preis: ${price} EUR, Details: ${notes}` }
            ]
        });

        const gesamtText = response.choices.message.content;
        let instaPost = gesamtText;
        let linkedinPost = gesamtText;

        if (gesamtText.includes('===TRENNUNG===')) {
            const teile = gesamtText.split('===TRENNUNG===');
            instaPost = teile[0] ? teile[0].trim() : gesamtText;
            linkedinPost = teile[1] ? teile[1].trim() : gesamtText;
        } else {
            const haelfte = Math.floor(gesamtText.length / 2);
            instaPost = gesamtText.substring(0, haelfte).trim();
            linkedinPost = gesamtText.substring(haelfte).trim();
        }

        res.json({ 
            success: true, 
            instagram: instaPost, 
            linkedin: linkedinPost 
        });

    } catch (error) {
        console.error("Social-Media-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler bei der Generierung" });
    }
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft fehlerfrei auf Port ${PORT}`);
});
