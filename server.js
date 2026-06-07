require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Hier aktivieren wir den KI-Baustein
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Die Schnittstelle, die die Makler-Daten verarbeitet
app.post('/api/generate', async (req, res) => {
    try {
        const { title, size, rooms, location, features } = req.body;

        // Wir bauen der KI eine glasklare Anweisung, was sie schreiben soll
        const prompt = `Schreibe ein exklusives, hochprofessionelles und verkaufsstarkes Immobilien-Exposé für folgendes Objekt:
        - Objekttyp/Titel: ${title}
        - Wohnfläche: ${size ? size + ' m²' : 'Nicht angegeben'}
        - Zimmeranzahl: ${rooms ? rooms : 'Nicht angegeben'}
        - Lage/Stadtteil: ${location}
        - Besondere Premium-Merkmale: ${features ? features : 'Keine angegeben'}

        Strukturiere das Exposé mit einer packenden Überschrift, einer eleganten Objektbeschreibung und einer übersichtlichen Auflistung der Highlights. Nutze einen luxuriösen und einladenden Ton, der gehobene Käufer anspricht.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Nutzt das extrem schnelle und günstige Gehirn
            messages: [
                { role: "system", content: "Du bist ein weltklasse Immobilien-Texter für Luxus-Exposés." },
                { role: "user", content: prompt }
            ],
        });

        res.json({ success: true, text: completion.choices[0].message.content });

    } catch (error) {
        console.error("KI-Fehler:", error);
        res.json({ success: false, error: error.message });
    }
});

// Startet den Server
app.listen(PORT, () => {
    console.log(`\n🟢 ERFOLG! Deine Premium-App läuft jetzt.`);
    console.log(`🟢 Öffne im Browser die Adresse: http://localhost:3000\n`);
});