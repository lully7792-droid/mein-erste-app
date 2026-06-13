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
// ROUTE 1: KI-EXPOSÉ-GENERATOR (PERFEKTIONIERT)
// ==========================================
app.post('/api/generate-expose', async (req, res) => {
    const { title, price, size, location, year, energy, style, notes, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: `Du bist ein erfahrener internationaler Immobilienmakler. Schreibe ein professionelles, flüssiges und verkaufsstarkes Exposé auf Deutsch basierend auf den Daten. 
                    STRENGE REGEL: Nutze ausschließlich real existierende Fakten der Region im In- und Ausland. Erfinde niemals Infrastrukturen oder Straßennamen frei dazu!
                    Passe deinen Tonfall und die Wortwahl exakt an den gewählten Schreibstil an: '${style}'. 
                    Strukturiere das Exposé übersichtlich mit Zwischenüberschriften.` 
                },
                { 
                    role: "user", 
                    content: `Titel: ${title}\nKaufpreis: ${price} EUR\nWohnfläche: ${size} m²\nOrt: ${location}\nBaujahr: ${year}\nEnergieklasse: ${energy}\nZusatzdetails: ${notes || "Keine"}` 
                }
            ]
        });

        // 🎯 ABSOLUT SICHER GEKAPSELT:
        let exposeText = "Fehler beim Generieren.";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            exposeText = response.choices[0].message.content;
        }

        res.json({ success: true, text: exposeText });
    } catch (error) {
        console.error("Exposé-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler beim Generieren des Exposés" });
    }
});

// ==========================================
// ROUTE 2: KI-MAIL-GENERATOR (EUROPA-SAFE)
// ==========================================
app.post('/api/generate-email', async (req, res) => {
    const { query, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: "Du bist ein kundenorientierter Immobilienmakler. Antworte auf die folgende Kundenanfrage absolut professionell, höflich und verkaufsstark auf Deutsch. STRENGE REGEL: Bleibe absolut faktengetreu zu den Kundendaten und erfinde keine rechtlichen oder geografischen Gegebenheiten der Region im In- und Ausland! Schlage am Ende subtil einen Besichtigungstermin vor. Formatiere die Ausgabe als sauberes HTML (nutze <p>, <strong> und <br> für Zeilenumbrüche, KEIN vollständiges HTML-Gerüst, keine Markdown-Sternchen)." 
                },
                { role: "user", content: `Anfrage: ${query}` }
            ]
        });

        let emailText = "Fehler beim Generieren der E-Mail.";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            emailText = response.choices[0].message.content;
        }

        res.json({ success: true, text: emailText });
    } catch (error) {
        console.error("E-Mail-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler beim Generieren der E-Mail" });
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
// ROUTE 10: KI-IMMOBILIEN-RADAR (EUROPA-SAFE)
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
                    content: "Du bist ein Spitzen-Makler im Bereich Immobilien-Einkauf. Analysiere die private Verkaufsanzeige. Schreibe zuerst deine Einschätzung zur Anzeige und danach das Akquise-Anschreiben für den Eigentümer auf Deutsch. STRENGE REGEL: Analysiere den Markt für ganz Europa absolut präzise und nutze für dein Anschreiben nur real existierende Argumente und Fakten der jeweiligen Region, ohne Dinge frei zu erfinden." 
                },
                { 
                    role: "user", 
                    content: `Region: ${region}\n\nAnzeigentext von privat:\n${adText}`
                }
            ]
        });

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

// ==========================================
// ROUTE 14: KI-FLYER- & AKQUISE-TEXTER
// ==========================================
app.post('/api/flyer-forge', async (req, res) => {
    const { street, reason, details, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: "Du bist ein genialer Werbetexter und Psychologe, spezialisiert auf lokale Kaltakquise für Immobilienmakler. Schreibe einen extrem auffälligen, verkaufsstarken und vertrauenswürdigen Text für einen Akquise-Flyer oder eine Postkarte auf Deutsch. Der Text muss eine fette, neugierig machende Überschrift (Headline), einen packenden Hauptteil und einen glasklaren Aufruf zur Aktion (Call-to-Action, z. B. kostenlose Wertermittlung) enthalten." 
                },
                { 
                    role: "user", 
                    content: `Aktionsgebiet/Straße: ${street}\nAnlass der Aktion: ${reason}\nZusatz-Fakten & Details: ${details || "Keine zusätzlichen Angaben"}`
                }
            ]
        });

        // 🎯 DIREKT ABSOLUT SICHER MIT [0] GEKAPSELT:
        let flyerText = "Flyer-Text konnte nicht erstellt werden.";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            flyerText = response.choices[0].message.content;
        }

        res.json({ 
            success: true, 
            text: flyerText 
        });

    } catch (error) {
        console.error("Flyer-Forge-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler beim Flyer-Texten im Backend" });
    }
});

// ==========================================
// ROUTE 15: KI-GEWERBE- & RENDITE-SPEZIALIST
// ==========================================
app.post('/api/investor-calc', async (req, res) => {
    const { price, rent, location, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const p = parseFloat(price) || 0;
        const r = parseFloat(rent) || 0;

        if (p <= 0 || r <= 0) {
            return res.status(400).json({ success: false, error: "Ungültige Werte für Kaufpreis oder Miete" });
        }

        // Kaufmännische Kennzahlen exakt berechnen
        const factor = (p / r).toFixed(2); // Mietvervielfältiger (z.B. 17.85x)
        const bruttorendite = ((r / p) * 100).toFixed(2); // Bruttorendite in % (z.B. 5.60%)

        const metrics = {
            factor: factor,
            yield: bruttorendite
        };

        // KI um den professionellen Investoren-Pitch bitten
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
                        messages: [
                { 
                    role: "system", 
                    content: "Du bist ein internationaler Immobilien-Analyst und Mikrolagen-Experte für den europäischen Markt. Deine Aufgabe ist es, eine hochexakte, lokal absolut korrekte und emotionale Lagebeschreibung auf Deutsch zu verfassen. STRENGE REGEL: Nutze ausschließlich real existierende Straßen, Infrastrukturen, Einkaufsmeilen, Parks und Verkehrsanbindungen der eingegebenen Region (egal ob in Deutschland oder im europäischen Ausland). Erfinde NIEMALS Fantasie-Namen oder Center-Komplexe! Wenn du die genaue Fußgängerzone oder lokale Hotspots nicht zu 100% kennst, konzentriere dich allgemein auf die echten geografischen Vorzüge (z.B. Autobahnanbindung, Flughafen-Nähe, Natur-Anteil, Demografie) der jeweiligen Stadt/Region, ohne Straßennamen zu erfinden. Passe den Text perfekt an die gewählte Zielgruppe an." 
                },
                { 
                    role: "user", 
                    content: `Eingegebener Stadtteil/Ort & Land: ${district}\nZielgruppe für das Objekt: ${target}\nManuell übergebene Zusatz-Highlights vor Ort: ${details || "Keine zusätzlichen Angaben"}`
                }
            ]

        });

        // 🎯 DIREKT MIT ABSOLUT SICHER GEKAPSELT:
        let pitchText = "Investoren-Pitch konnte nicht erstellt werden.";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            pitchText = response.choices[0].message.content;
        }

        res.json({ 
            success: true, 
            metrics: metrics, 
            pitch: pitchText 
        });

    } catch (error) {
        console.error("Gewerbe-Rechner-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler beim Berechnen im Backend" });
    }
});

// ==========================================
// ROUTE 16: KI-MODERNISIERUNGS- & HOME-STAGING
// ==========================================
app.post('/api/staging-forge', async (req, res) => {
    const { room, current, target, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: "Du bist ein genialer Innenarchitekt, Home-Staging-Experte und Immobilien-Verkaufsprofi. Deine Aufgabe ist es, für einen veralteten Raum ein modernes, hochattraktives Renovierungs- und Einrichtungskonzept auf Deutsch zu entwickeln. Schreibe zuerst konkrete, optisch wirksame Maßnahmen (Böden, Wände, Licht, Möbel) für den Umbau auf und formuliere danach einen emotionalen, bildhaften Verkaufstext für das Exposé, der potenziellen Käufern die zukünftige Pracht perfekt vor Augen führt." 
                },
                { 
                    role: "user", 
                    content: `Raumtyp: ${room}\nIst-Zustand: ${current}\nGewünschter Ziel-Stil: ${target}`
                }
            ]
        });

        // 🎯 DIREKT ABSOLUT SICHER GEKAPSELT:
        let stagingText = "Designkonzept konnte nicht erstellt werden.";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            stagingText = response.choices[0].message.content;
        }

        res.json({ 
            success: true, 
            text: stagingText 
        });

    } catch (error) {
        console.error("Staging-Forge-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler beim Home-Staging im Backend" });
    }
});

// ==========================================
// ROUTE 17: KI-TELEFON-LEITFADEN-SCHMIED
// ==========================================
app.post('/api/phone-forge', async (req, res) => {
    const { situation, objection, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: "Du bist ein absoluter Spitzen-Verkaufstrainer, spezialisiert auf Telefon-Psychologie, Kaltakquise und Einwandbehandlung für Premium-Immobilienmakler. Deine Aufgabe ist es, einen glasklaren, schrittweisen Telefon-Leitfaden auf Deutsch zu entwickeln. Gib dem Makler präzise Wort-für-Wort-Formulierungen an die Hand, um den Kundeneinwand elegant zu entkräften, den Nutzen der Maklerdienstleistung zu belegen und das Gespräch psychologisch sicher zum Ziel (Termin oder Abschluss) zu führen." 
                },
                { 
                    role: "user", 
                    content: `Gesprächs-Situation: ${situation}\nKonkreter Kundeneinwand: "${objection}"`
                }
            ]
        });

        // 🎯 DIREKT ABSOLUT SICHER GEKAPSELT:
        let phoneText = "Telefon-Leitfaden konnte nicht erstellt werden.";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            phoneText = response.choices[0].message.content;
        }

        res.json({ 
            success: true, 
            text: phoneText 
        });

    } catch (error) {
        console.error("Telefon-Forge-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler beim Telefon-Skript im Backend" });
    }
});

// ==========================================
// ROUTE 18: KI-IMMOBILIEN-LEXIKON-GENERATOR
// ==========================================
app.post('/api/lexicon-forge', async (req, res) => {
    const { term, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: "Du bist ein erfahrener Immobilien-Fachanwalt und genialer Kommunikator. Deine Aufgabe ist es, einen schweren juristischen Fachbegriff oder eine komplexe Klausel aus dem Immobilienrecht (z.B. Grundbuch, Notarvertrag) in absolut einfache Alltagssprache für Laien zu übersetzen. Schreibe zuerst eine kurze, glasklare Definition und formuliere danach eine fertige, freundliche Nachricht (z. B. für WhatsApp oder E-Mail), die der Makler direkt an seinen zögernden Kunden senden kann, um Missverständnisse und Ängste sofort abzubauen." 
                },
                { 
                    role: "user", 
                    content: `Zu erklärender Begriff/Klausel: "${term}"`
                }
            ]
        });

        // 🎯 DIREKT ABSOLUT SICHER GEKAPSELT:
        let lexiconText = "Erklärung konnte nicht erstellt werden.";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            lexiconText = response.choices[0].message.content;
        }

        res.json({ 
            success: true, 
            text: lexiconText 
        });

    } catch (error) {
        console.error("Lexikon-Forge-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler beim Lexikon-Eintrag im Backend" });
    }
});

// ==========================================
// ROUTE 14: KI-MAENGEL-ENTSCHAERFER (FEHLERFREI)
// ==========================================
app.post('/api/defect-mitigate', async (req, res) => {
    const { defect, context, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: "Du bist ein erfahrener Bausachverständiger und Immobilien-Vertriebsprofi. Deine Aufgabe ist es, einen vom Kaufinteressenten genannten Mangel bautechnisch einzuordnen und vertrieblich zu entschärfen. Schreibe eine sachliche Argumentation auf Deutsch, die den Mangel nicht verschweigt, aber in Relation zum Baujahr setzt. Biete dem Makler präzise Satzbausteine, um unberechtigte, massive Preisabzüge im Gespräch psychologisch geschickt abzuwehren." 
                },
                { 
                    role: "user", 
                    content: `Genannter Mangel: "${defect}"\nZusatz-Kontext & Details: ${context || "Keine zusätzlichen Angaben"}`
                }
            ]
        });

        // 🎯 HIER MIT DER ETABLIERTEN [0]-SCHUBLADE ABGESICHERT:
        let defectText = "Mängel-Analyse konnte nicht erstellt werden.";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            defectText = response.choices[0].message.content;
        }

        res.json({ 
            success: true, 
            text: defectText 
        });

    } catch (error) {
        console.error("Maengel-Mitigate-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler beim Maengel-Check im Backend" });
    }
});

// ==========================================
// ROUTE 15: KI-STADTTEIL-INSIDER & MIKROLAGE
// ==========================================
app.post('/api/insider-forge', async (req, res) => {
    const { district, target, details, password } = req.body;
    if (password !== "makler-erfolg") return res.status(401).json({ success: false, error: "Nicht autorisiert" });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: "Du bist ein genialer Immobilienmakler mit absolutem Insider-Wissen über lokale Mikrolagen und Stadtteile. Deine Aufgabe ist es, eine emotionale, detailreiche und verkaufsstarke Lagebeschreibung auf Deutsch für ein Immobilienexposé zu schreiben. Passe den Fokus (Infrastruktur, Schulen, Ruhe, Freizeit, Anbindung) exakt an die gewählte Zielgruppe an. Hebe die Vorteile der Mikrolage hervor, sodass sich der Leser sofort bildhaft vorstellen kann, dort zu leben." 
                },
                { 
                    role: "user", 
                    content: `Stadtteil/Ort: ${district}\nZielgruppe: ${target}\nZusatz-Highlights vor Ort: ${details || "Keine zusätzlichen Angaben"}`
                }
            ]
        });

        // 🎯 ABSOLUT SICHER GEKAPSELT:
        let insiderText = "Lagebeschreibung konnte nicht erstellt werden.";
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            insiderText = response.choices[0].message.content;
        }

        res.json({ 
            success: true, 
            text: insiderText 
        });

    } catch (error) {
        console.error("Insider-Forge-Fehler:", error);
        res.status(500).json({ success: false, error: "Fehler beim Lagebericht im Backend" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft fehlerfrei auf Port ${PORT}`);
});
