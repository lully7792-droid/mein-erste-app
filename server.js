require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const path = require('path');

const app = express();
const port = 3000;

// Hier aktivieren wir den KI-Baustein
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Diese Funktion wartet darauf, dass der Makler in der App auf den Button klickt
app.post('/api/generate', async (req, res) => {
    const { typ, groese, features, stil } = req.body;

    try {
        // Hier schicken wir den Auftrag live an die OpenAI-KI
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Das ist die schnellste und günstigste KI für Apps
            messages: [
                { role: "system", content: "Du bist ein weltklasse Immobilienmakler. Schreibe professionelle, packende Exposé-Texte auf Deutsch." },
                { role: "user", content: `Schreibe ein exklusives Exposé für folgende Immobilie: Typ: ${typ}, Größe: ${groese}m², Besondere Merkmale: ${features}. Der Schreibstil soll unbedingt wie folgt sein: ${stil || 'luxuriös'}. Der Text soll modern und extrem verkaufsstark sein.` }
            ],
        });

        const kiText = response.choices[0].message.content;
        res.json({ text: kiText });

    } catch (error) {
        console.error("Fehler beim KI-Aufruf:", error);
        res.status(500).json({ error: "Die KI hat gerade Schluckauf. Prüfe deinen API-Key!" });
    }
});

app.listen(port, () => {
    console.log(`\n🚀 ERFOLG! Deine App läuft jetzt als echter Server.`);
    console.log(`🌍 Öffne im Browser die Adresse: http://localhost:${port}\n`);
});