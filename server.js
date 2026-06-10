const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// OpenAI Verbindung mit dem absolut direkten Schlüssel
const key1 = "k-proj-ish6faE2wt0ljf043YX1tv6Z4_yG2Weh4eT71KAAm6SAmmdz";
const key2 = "-sdFy7iIJn_SQhBa66KmzA_tqbT3BlbkFJs5HooC_n1CinHPjXJZ3QFCKRH_UVOTKnEKAmGRfLhUo-Xp8oQwKMbNO4-oAZur_VwIBqAAj4YA";

const openai = new OpenAI({ apiKey: key1 + key2 });

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
                { role: "system", content: "Du bist Immobilienmakler. Schreibe ein Exposé auf Deutsch." },
                { role: "user", content: `Titel: ${title}, Ort: ${location}, Preis: ${price}, Jahr: ${year}, Energie: ${energy}, Details: ${notes}` }
            ]
        });

        let exposeText = "Fehler bei der Textübertragung von OpenAI.";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            exposeText = response.choices[0].message.content;
        }

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
                { role: "system", content: "Analysiere das Bild und nenne die Highlights." },
                { role: "user", content: [{ type: "text", text: "Highlights nennen:" }, { type: "image_url", image_url: { "url": image } }] }
            ]
        });

        let analysisText = "Fehler bei der Bildanalyse.";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            analysisText = response.choices[0].message.content;
        }
        res.json({ success: true, analysis: analysisText });
    } catch (error) {
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
                { role: "system", content: "Schreibe eine professionelle Antwort-E-Mail auf Deutsch." },
                { role: "user", content: query }
            ]
        });

        let mailText = "Fehler bei der E-Mail-Generierung.";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            mailText = response.choices[0].message.content;
        }
        res.json({ success: true, mail: mailText });
    } catch (error) {
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
                { role: "system", content: "Generiere zwei Posts auf Deutsch. Trenne mit '===TRENNUNG==='. Post 1 Instagram, Post 2 LinkedIn." },
                { role: "user", content: `Titel: ${title}, Ort: ${location}, Preis: ${price}, Details: ${notes}` }
            ]
        });

        let gesamtText = "Fehler";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            gesamtText = response.choices[0].message.content;
        }

        let instaPost = gesamtText;
        let linkedinPost = gesamtText;

        if (gesamtText.includes('===TRENNUNG===')) {
            const teile = gesamtText.split('===TRENNUNG===');
            instaPost = teile[0] ? teile[0].trim() : gesamtText;
            linkedinPost = teile[1] ? teile[1].trim() : gesamtText;
        }

        res.json({ success: true, instagram: instaPost, linkedin: linkedinPost });
    } catch (error) {
        res.status(500).json({ success: false, error: "Fehler bei der Generierung" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Server läuft auf Port ${PORT}`); });


