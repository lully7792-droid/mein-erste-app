import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Hier deinen echten OpenAI Key eintragen, sobald aufgeladen:
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Dein geheimes Passwort für die App
const SECRET_PASSWORD = "makler-erfolg";

app.post('/api/generate', async (expressReq, expressRes) => {
    const { title, size, rooms, price, year, energy, location, tone, features, password } = expressReq.body;

    if (password !== SECRET_PASSWORD) {
        return expressRes.json({ success: false, error: "Ungültiger Enterprise Lizenzschlüssel!" });
    }

    const prompt = `Du bist ein精英-Immobilienmakler. Schreibe ein hochprofessionelles, verkaufsstarkes Exposé für folgende Immobilie.
    Titel/Typ: ${title}
    Lage: ${location}
    Wohnfläche: ${size} m²
    Zimmer: ${rooms}
    Kaufpreis: ${price} €
    Baujahr: ${year}
    Energieklasse: ${energy}
    Besondere Merkmale: ${features}
    
    Der Schreibstil muss absolut ${tone} sein.
    Strukturiere das Exposé mit einer packenden Überschrift, einem emotionalen Einleitungstext (Objektbeschreibung), einer Übersicht der Highlights und einem klaren Aufruf zur Kontaktaufnahme (Call to Action).`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        });

        expressRes.json({ success: true, text: response.choices[0].message.content });
    } catch (error) {
        console.error("OpenAI Server-Fehler:", error);
        expressRes.json({ success: false, error: error.message });
    }
});

app.listen(3000, () => {
    console.log("🟢 ERFOLG! Deine App läuft jetzt als echter Server.");
    console.log("🟢 Öffne im Browser die Adresse: http://localhost:3000");
});