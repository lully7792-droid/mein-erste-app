require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 🔒 DEIN GEHEIMES PASSWORT FÜR KUNDEN
const ACCES_PASSWORD = "IMMO-ERFOLG-2026";

app.post('/api/generate', async (req, res) => {
    try {
        const { title, size, rooms, price, year, energy, location, tone, features, password } = req.body;

        // 1. Passwortprüfung auf dem Server
        if (password !== ACCES_PASSWORD) {
            return res.json({ success: false, error: "Ungültiger Lizenzschlüssel! Zugriff verweigert." });
        }

        // 2. Wir füttern das Gehirn mit den neuen Profi-Daten
        const prompt = `Schreibe ein professionelles Immobilien-Exposé mit folgenden Parametern:
        - Typ: ${title}
        - Lage: ${location}
        - Wohnfläche: ${size ? size + ' m²' : 'Nicht angegeben'}
        - Zimmer: ${rooms ? rooms : 'Nicht angegeben'}
        - Kaufpreis: ${price ? price + ' €' : 'Nicht angegeben'}
        - Baujahr: ${year ? year : 'Nicht angegeben'}
        - Energieeffizienzklasse: ${energy}
        - Besondere Highlights: ${features ? features : 'Keine angegeben'}

        WICHTIG - Wähle exakt folgenden Tonfall für den Text: Bitte schreibe den Text ${tone}.
        Strukturiere das Exposé mit einer packenden Überschrift, einem fesselnden Einleitungstext und einer Übersicht der Highlights.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Du bist ein meisterhafter Immobilien-Texter für kommerzielle Premium-Exposés." },
                { role: "user", content: prompt }
            ],
        });

        res.json({ success: true, text: completion.choices.message.content });

    } catch (error) {
        console.error("Fehler:", error);
        res.json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🟢 Enterprise-Server läuft fehlerfrei auf Port ${PORT}\n`);
});