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

// ==========================================
// ROUTE 8: KI-VERTRAGS-PRÜFER (FEHLERFREI)
// ==========================================
app.post('/api/analyze-contract', async (req, res) => {
    const { contractText, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Du bist ein erfahrener Immobilien-Rechtsexperte. Analysiere den bereitgestellten Vertragstext oder die Klausel auf Deutsch. Weise auf potenzielle Stolperfallen, unübliche Nachteilsklauseln oder Risiken für Käufer/Verkäufer/Mieter hin und gib eine klare Einschätzung ab." },
                { role: "user", content: `Vertragstext/Klausel: ${contractText}` }
            ]
        });

        let analyseText = "Fehler bei der Vertragsanalyse.";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            analyseText = response.choices[0].message.content;
        }

        res.json({ success: true, text: analyseText });
    } catch (error) {
        console.error("Vertragsprüfer-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler bei der Vertragsanalyse" });
    }
});

// ==========================================
// ROUTE 9: KI-KUNDEN-PROFILE-MATCHING (FEHLERFREI)
// ==========================================
app.post('/api/match-profile', async (req, res) => {
    const { buyerCriteria, propTitle, propPrice, propLocation, propNotes, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Du bist ein genialer Vertriebs-Makler. Vergleiche die Suchkriterien des Kunden mit den Objektdaten der aktuellen Immobilie. Schreibe eine extrem maßgeschneiderte, persönliche und überzeugende Einladungs-E-Mail auf Deutsch an diesen Suchkunden. Hebe genau die Punkte hervor, die perfekt zu seinen Wünschen passen." },
                { role: "user", content: `Suchkriterien des Kunden: ${buyerCriteria}\n\nAktuelles Objekt:\nTitel: ${propTitle}\nPreis: ${propPrice} EUR\nOrt: ${propLocation}\nDetails: ${propNotes}` }
            ]
        });

        let matchingText = "Fehler beim Kunden-Matching.";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            matchingText = response.choices[0].message.content;
        }

        res.json({ success: true, text: matchingText });
    } catch (error) {
        console.error("Matching-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler beim Kunden-Matching" });
    }
});

// ==========================================
// ROUTE 10: KI-IMMOBILIEN-RADAR (KORRIGIERT)
// ==========================================
app.post('/api/radar-hunt', async (req, res) => {
    const { region, adText, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: "Du bist ein Spitzen-Makler im Bereich Immobilien-Einkauf. Analysiere die private Verkaufsanzeige. Schreibe zuerst deine Einschätzung zur Anzeige und danach das Akquise-Anschreiben für den Eigentümer." 
                },
                { 
                    role: "user", 
                    content: `Region: ${region}\n\nAnzeigentext von privat:\n${adText}`
                }
            ]
        });

        // 🎯 HIER WURDE DIE LÜCKE MIT DER [0] PERFEKT GESCHLOSSEN:
        let gesamtText = "Fehler beim Generieren des Textes.";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            gesamtText = response.choices[0].message.content;
        }

        res.json({ 
            success: true, 
            analysis: "Analyse und Akquise-Strategie live generiert:", 
            mail: gesamtText 
        });

    } catch (error) {
        console.error("Radar-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler beim Immobilien-Radar im Backend" });
    }
});

// ==========================================
// ROUTE 11: KI-FINANZIERUNGS-RECHNER
// ==========================================
app.post('/api/finance-calc', async (req, res) => {
    const { price, equity, interest, repayment, commissionRate, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        // Mathematische Berechnungen im Backend durchführen
        const tax = price * 0.055; // Grunderwerbsteuer NRW (5,5%)
        const notary = price * 0.02; // Notar & Grundbuch (ca. 2%)
        const commission = price * (commissionRate / 100); // Maklerprovision
        const totalCost = price + tax + notary + commission; // Gesamtkosten
        const loanAmount = Math.max(0, totalCost - equity); // Benötigter Kreditrahmen
        
        // Jährliche Annuität = Kreditrahmen * (Zins% + Tilgung%)
        const yearlyAnnuity = loanAmount * ((interest + repayment) / 100);
        const monthlyRate = yearlyAnnuity / 12; // Monatliche Rate

        // Packe die nackten Zahlen in das Datenobjekt für das Frontend
        const costs = {
            tax: Math.round(tax),
            notary: Math.round(notary),
            commission: Math.round(commission),
            totalCost: Math.round(totalCost),
            loanAmount: Math.round(loanAmount),
            monthlyRate: Math.round(monthlyRate)
        };

        // KI um Verkaufs-Argumentation bitten
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: "Du bist ein genialer Finanzierungsberater und Immobilien-Vertriebsprofi. Dir werden die exakten Berechnungen einer Immobilie übermittelt. Deine Aufgabe ist es, einen überzeugenden, psychologisch cleveren Argumentationsleitfaden für das Kundengespräch zu schreiben. Erkläre dem Kunden im Text sachlich aber verkaufsstark, warum sich diese Investition (entweder als Eigennutzung oder Kapitalanlage) trotz der aktuellen Zinslage lohnt und wie er die monatliche Belastung einwerten kann." 
                },
                { 
                    role: "user", 
                    content: `Kaufpreis: ${price} €\nNebenkosten gesamt (Steuer, Notar, Provision): ${tax + notary + commission} €\nBenötigtes Darlehen: ${costs.loanAmount} €\nZinssatz: ${interest}%\nTilgung: ${repayment}%\nErrechnete Monatsrate: ${costs.monthlyRate} €/Monat`
                }
            ]
        });

        let argumentationText = "Argumentationsleitfaden konnte nicht erstellt werden.";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            argumentationText = response.choices[0].message.content;
        }

        res.json({ 
            success: true, 
            costs: costs, 
            argumentation: argumentationText 
        });

    } catch (error) {
        console.error("Finanz-Rechner-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler beim Berechnen im Backend" });
    }
});

// ==========================================
// ROUTE 12: KI-OBJEKT-VERGLEICHER & MARKTANALYSE
// ==========================================
app.post('/api/market-compare', async (req, res) => {
    const { 
        myPrice, mySize, myFeat,
        c1Price, c1Size, c1Feat,
        c2Price, c2Size, c2Feat,
        password 
    } = req.body;

    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        // Mathematische Berechnung der Quadratmeterpreise für den Prompt
        const myP = parseFloat(myPrice) || 0;
        const myS = parseFloat(mySize) || 1;
        const myQm = Math.round(myP / myS);

        const c1P = parseFloat(c1Price) || 0;
        const c1S = parseFloat(c1Size) || 1;
        const c1Qm = c1P > 0 ? Math.round(c1P / c1S) : "Nicht angegeben";

        const c2P = parseFloat(c2Price) || 0;
        const c2S = parseFloat(c2Size) || 1;
        const c2Qm = c2P > 0 ? Math.round(c2P / c2S) : "Nicht angegeben";

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: "Du bist ein genialer Immobilien-Analyst und strategischer Verhandlungsführer für Top-Makler. Dir werden die Preis- und Leistungsdaten von drei Immobilien übermittelt (Dein Objekt vs. zwei Konkurrenzobjekte). Erstelle eine knallharte, professionelle Marktanalyse auf Deutsch. Hebe die 'unfairen Vorteile' deines Objekts hervor und liefere eine präzise Argumentationskette für Preisverhandlungen mit Verkäufern oder Einwandbehandlungen mit potenziellen Käufern." 
                },
                { 
                    role: "user", 
                    content: `📊 DATEN-BASIS FÜR DIE ANALYSE:\n\n` +
                             `🏠 DEIN OBJEKT:\n- Preis: ${myP} EUR\n- Fläche: ${myS} m²\n- Qm-Preis: ${myQm} EUR/m²\n- Besonderheiten: ${myFeat || "Keine"}\n\n` +
                             `🛑 KONKURRENZ 1:\n- Preis: ${c1P} EUR\n- Fläche: ${c1S} m²\n- Qm-Preis: ${c1Qm} EUR/m²\n- Besonderheiten: ${c1Feat || "Keine"}\n\n` +
                             `🛑 KONKURRENZ 2:\n- Preis: ${c2P} EUR\n- Fläche: ${c2S} m²\n- Qm-Preis: ${c2Qm} EUR/m²\n- Besonderheiten: ${c2Feat || "Keine"}`
                }
            ]
        });

        let analysisText = "Marktbericht konnte nicht erstellt werden.";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            analysisText = response.choices[0].message.content;
        }

        res.json({ 
            success: true, 
            analysis: analysisText 
        });

    } catch (error) {
        console.error("Vergleichs-Rechner-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler beim Berechnen im Backend" });
    }
});

// ==========================================
// ROUTE 13: KI-KUNDEN-NEWSLETTER-SCHMIED
// ==========================================
app.post('/api/newsletter-forge', async (req, res) => {
    const { title, details, tone, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" }, // 🎯 JSON-Format für fehlerfreie Trennung von Betreff und Code
            messages: [
                { 
                    role: "system", 
                    content: "Du bist ein genialer E-Mail-Marketing-Experte für Immobilienmakler. Schreibe eine packende, verkaufsstarke Newsletter-E-Mail an Suchkunden basierend auf den übermittelten Daten. Antworte AUSSCHLIESSLICH im JSON-Format mit exakt diesen beiden Feldern:\n{\n  \"subject\": \"Eine emotionale, klickstarke Betreffzeile hier\",\n  \"htmlCode\": \"Der komplette, bildschön designte HTML-Code der E-Mail (inline CSS, sauber zentrierte Tabellen-Struktur, edle Schriftarten, farbige Akzente passend zum Tonfall, mobil-optimiert) hier\"\n}" 
                },
                { 
                    role: "user", 
                    content: `Objekttitel: ${title}\nFakten & Highlights: ${details}\nTonfall: ${tone}`
                }
            ]
        });

        // 🎯 HIER WURDE DIE [0] BOMBENFEST EINGESETZT:
        let jsonText = "{}";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            jsonText = response.choices[0].message.content;
        }
        const resultData = JSON.parse(jsonText);

        res.json({ 
            success: true, 
            subject: resultData.subject || "Exklusives Immobilienangebot für Sie", 
            htmlCode: resultData.htmlCode || "📧 Newsletter-Inhalt konnte nicht generiert werden." 
        });

    } catch (error) {
        console.error("Newsletter-Forge-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler beim Newsletter-Schmieden im Backend" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft fehlerfrei auf Port ${PORT}`);
});
