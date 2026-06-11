const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// OpenAI API-Verbindung aufbauen
const keyTeil1 = "sk-proj-ish6faE2wt01jf043YX1tV6Z4_y62Weh4eT71KAM6SAmmdz";
const keyTeil2 = "-sdFy7iIJn_SQhBa66KmzA_tqbT3BlbkFJs5HooC_n1CinHPjXJZ3QFCKRH_UVOTKnEKAmGRfLhUo-Xp8oQwKMbNO4-oAZur_VwIBqAAj4YA";

const openai = new OpenAI({
    apiKey: keyTeil1 + keyTeil2
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

    if (password !== "makler-erfolg") {
        return res.status(401).json({ success: false, error: "Nicht autorisiert" });
    }

    try {
         

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
                    content: "Du bist ein professioneller Immobilienmakler. Schreibe eine höfliche Antwort-E-Mail auf Deutsch basierend auf der Kundenanfrage. Generiere ZUSÄTZLICH ganz oben 3 packende Betreffzeilen-Optionen. Trenne die Betreffzeilen-Optionen und den eigentlichen E-Mail-Text strikt mit dem Wort '===TRENNUNG==='. Schreibe erst die 3 Betreffzeilen, dann das Trennwort, dann die E-Mail." 
                },
                { role: "user", content: `Hier ist die Kundenanfrage: ${query}` }
            ]
        });

        // 🎯 Hier zerlegen wir die Antwort sauber und fangen Fehler ab
        let gesamtText = "Fehler bei der Generierung.";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            gesamtText = response.choices[0].message.content;
        }

        let betreffText = "1. Wichtige Information zu Ihrer Anfrage\n2. Rückmeldung zu Ihrem Immobilienwunsch\n3. Details zu Ihrer Nachricht";
        let mailText = gesamtText;

        if (gesamtText.includes('===TRENNUNG===')) {
            const teile = gesamtText.split('===TRENNUNG===');
            betreffText = teile[0].trim();
            mailText = teile[1].trim();
        }

        res.json({ 
            success: true, 
            subjects: betreffText, 
            mail: mailText 
        });

        const mailText = response.choices[0].message.content;
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

        const gesamtText = response.choices[0].message.content;
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
