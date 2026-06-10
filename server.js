import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import cors from 'cors';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const SECRET_PASSWORD = "makler-erfolg";

app.post('/api/generate', async (expressReq, expressRes) => {
    const { title, size, rooms, price, year, energy, location, tone, features, password } = expressReq.body;

    if (password !== SECRET_PASSWORD) {
        return expressRes.json({ success: false, error: "Ungültiger Enterprise Lizenzschlüssel!" });
    }

    const prompt = `Du bist ein Elite-Immobilienmakler und Social Media Experte. Schreibe zwei Texte für folgende Immobilie:
    Titel/Typ: ${title}
    Lage: ${location}
    Wohnfläche: ${size} m²
    Zimmer: ${rooms}
    Kaufpreis: ${price} €
    Baujahr: ${year}
    Energieklasse: ${energy}
    Besondere Merkmale: ${features}
    
    Der Schreibstil muss absolut ${tone} sein.
    
    TEXT 1 (Klassisches Exposé):
    Strukturiere das Exposé mit einer packenden Überschrift, einem emotionalen Einleitungstext (Objektbeschreibung), einer Übersicht der Highlights und einem klaren Aufruf zur Kontaktaufnahme (Call to Action).
    
    TEXT 2 (Social Media Post):
    Schreibe einen separaten, extrem packenden Social Media Post für Instagram/LinkedIn. Nutze passende Emojis, hebe die 3 wichtigsten Fakten hervor und füge am Ende relevante Hashtags sowie einen Call to Action hinzu.
    
    WICHTIG: Trenne Text 1 und Text 2 in deiner Antwort strikt mit dem Wortzeichen "---SOCIAL_MEDIA_SPLIT---"!`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        });

        const fullResponseText = response.choices && response.choices[0] ? response.choices[0].message.content : response.choices.message.content;
        
        let exposeText = fullResponseText;
        let socialMediaText = "Beitrag wird generiert...";

        if (fullResponseText.includes("---SOCIAL_MEDIA_SPLIT---")) {
            const parts = fullResponseText.split("---SOCIAL_MEDIA_SPLIT---");
            exposeText = parts[0] ? parts[0].trim() : fullResponseText;
            socialMediaText = parts[1] ? parts[1].trim() : "Beitrag wird generiert...";
        } else {
            exposeText = fullResponseText;
            socialMediaText = fullResponseText;
        }

        expressRes.json({ 
            success: true, 
            text: exposeText,
            socialMedia: socialMediaText
        });
    } catch (error) {
        console.error("OpenAI Server-Fehler:", error);
        expressRes.json({ success: false, error: error.message });
    }
});


   // NEU: Route für die KI-Bildanalyse
app.post('/api/analyze-image', async (req, res) => {
    try {
        const { image, password } = req.body;

        // Passwort-Schutz prüfen
        if (password !== SECRET_PASSWORD) {
            return res.status(401).json({ success: false, error: "Ungültiges Passwort" });
        }

        if (!image) {
            return res.status(400).json({ success: false, error: "Kein Bild übermittelt" });
        }

        // OpenAI API mit dem Bild aufrufen (Vision-Feature)
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        { 
                            type: "text", 
                            text: "Analysierte dieses Immobilien-Foto professionell für einen Makler. Welche Räumlichkeit ist zu sehen? Welche Ausstattungsmerkmale fallen positiv auf (z.B. Parkett, Fußbodenheizung, Einbaustrahler, moderne Fliesen, Lichtverhältnisse)? Schreibe eine stichpunktartige Liste der Highlights für ein Exposé." 
                        },
                        {
                            type: "image_url",
                            image_url: {
                                "url": image // Hier übergeben wir das Base64-Bild
                            }
                        }
                    ],
                },
            ],
        
        });

        const analysis = response.choices[0].message.content;
        res.json({ success: true, analysis });

    } catch (error) {
        console.error("Fehler bei der Bildanalyse:", error);
        res.status(500).json({ success: false, error: error.message });
    }
     
    });

    app.listen(3000, () => {
        console.log("🚀 Server läuft auf http://localhost:3000");
    }); 