let savedPassword = "";
let remainingCredits = 10;

function checkLogin() {
    const passwordInput = document.getElementById('passwordInput').value;
    if (passwordInput === "makler-erfolg") {
        savedPassword = passwordInput;
        document.getElementById('loginSection').style.display = 'none';
        const app = document.getElementById('appSection');
        if (app) {
            app.style.display = 'block';
            app.classList.remove('hidden');
        }
        updateCreditDisplay();
    } else {
        alert("Falsches Passwort! Bitte versuche es erneut.");
    }
}

function updateCreditDisplay() {
    const creditBox = document.getElementById('creditDisplay');
    if (creditBox) {
        creditBox.innerText = `Verbleibende Abfragen: ${remainingCredits}`;
    }
}

async function generateExpose() {
    if (remainingCredits <= 0) {
        alert("Keine Credits mehr übrig! Bitte lade dein Konto auf.");
        return;
    }
    const title = document.getElementById('title').value;
    const price = document.getElementById('price').value;
    const location = document.getElementById('location').value;
    const year = document.getElementById('year').value;
    const energy = document.getElementById('energy').value;
    const notes = document.getElementById('notes').value;

    if (!title || !price || !location) {
        alert("Bitte fülle mindestens den Objekttitel, Kaufpreis und Ort aus.");
        return;
    }

    const outputDiv = document.getElementById('exposeOutput');
    const outputText = document.getElementById('exposeText');
    
    outputDiv.classList.remove('hidden');
    outputText.innerText = "KI schreibt das Exposé, bitte warten...";

    try {
        const response = await fetch('/api/generate-expose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, price, location, year, energy, notes, password: savedPassword })
        });
        const data = await response.json();
        if (data.success) {
            outputText.innerText = data.text;
            saveToHistory("Exposé", title);
            remainingCredits--;
            updateCreditDisplay();
        } else {
            outputText.innerText = "Fehler: " + data.error;
        }
    } catch (error) {
        outputText.innerText = "Server-Fehler bei der Exposé-Erstellung.";
    }
}

async function analyzeImage() {
    const fileInput = document.getElementById('imageInput');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert("Bitte wähle zuerst ein Bild aus.");
        return;
    }
    if (remainingCredits <= 0) {
        alert("Keine Credits mehr übrig!");
        return;
    }
    const file = fileInput.files[0];
    const btn = document.getElementById('analyzeImageBtn');
    const resultDiv = document.getElementById('analysisResult');
    const resultText = document.getElementById('analysisText');

    btn.disabled = true;
    btn.innerText = "Analysiere Bild...";
    resultDiv.classList.remove('hidden');
    resultText.innerText = "Die KI scannt das Bild, bitte warten...";

    const reader = new FileReader();
    reader.onloadend = async function () {
        const base64Image = reader.result;
        try {
            const response = await fetch('/api/analyze-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image, password: savedPassword })
            });
            const data = await response.json();
            if (data.success) {
                resultText.innerText = data.analysis;
                saveToHistory("Bildanalyse", "Bild-Upload");
                remainingCredits--;
                updateCreditDisplay();
            } else {
                resultText.innerText = "Fehler: " + data.error;
            }
        } catch (error) {
            resultText.innerText = "Server-Fehler bei der Analyse.";
        } finally {
            btn.disabled = false;
            btn.innerText = "Bild analysieren & Highlights extrahieren";
        }
    };
    reader.readAsDataURL(file);
}
async function generateMail() {
    const queryInput = document.getElementById('clientQueryInput');
    if (!queryInput || !queryInput.value.trim()) {
        alert("Bitte kopiere zuerst eine Kundenanfrage in das Textfeld.");
        return;
    }
    if (remainingCredits <= 0) {
        alert("Keine Credits mehr übrig!");
        return;
    }
    const btn = document.getElementById('generateEmailBtn');
    const resultBox = document.getElementById('emailResultBox');
    const resultText = document.getElementById('emailResultText');

    btn.disabled = true;
    btn.innerText = "Generiere E-Mail...";
    resultBox.classList.remove('hidden');
    resultText.innerText = "Die KI verfasst die Antwort und Betreffzeilen, bitte warten...";

    try {
        const response = await fetch('/api/generate-mail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: queryInput.value, password: savedPassword })
        });
        const data = await response.json();
        if (data.success) {
            resultText.innerHTML = `
                <div style="background: rgba(16, 185, 129, 0.1); padding: 10px; border-radius: 4px; margin-bottom: 15px; border-left: 4px solid var(--accent);">
                    <strong>💡 Betreffzeilen-Vorschläge:</strong><br>
                    <span style="white-space: pre-wrap;">${data.subjects}</span>
                </div>
                <div>
                    <strong>✉️ Antwort-Nachricht:</strong><br>
                    <span style="white-space: pre-wrap;">${data.mail}</span>
                </div>
            `;
            saveToHistory("Kunden-Mail", "Antwort + Betreff generiert");
            remainingCredits--;
            updateCreditDisplay();
        } else {
            resultText.innerText = "Fehler: " + data.error;
        }
    } catch (error) {
        resultText.innerText = "Server-Fehler bei der E-Mail-Erstellung.";
    } finally {
        btn.disabled = false;
        btn.innerText = "Antwort-E-Mail generieren";
    }
}

async function generateSocialMedia() {
    if (remainingCredits <= 0) {
        alert("Keine Credits mehr übrig!");
        return;
    }
    const title = document.getElementById('title').value;
    const price = document.getElementById('price').value;
    const location = document.getElementById('location').value;
    const notes = document.getElementById('notes').value;

    if (!title || !price || !location) {
        alert("Bitte fülle zuerst Objekttitel, Kaufpreis und Ort ganz oben aus.");
        return;
    }

    const btn = document.getElementById('generateSocialBtn');
    const resultBox = document.getElementById('socialResultBox');
    
    btn.disabled = true;
    btn.innerText = "Erstelle Posts...";
    resultBox.classList.remove('hidden');
    document.getElementById('instaText').innerText = "KI schreibt...";
    document.getElementById('linkedinText').innerText = "KI schreibt...";

    try {
        const response = await fetch('/api/generate-social', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, price, location, notes, password: savedPassword })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('instaText').innerText = data.instagram;
            document.getElementById('linkedinText').innerText = data.linkedin;
            saveToHistory("Social Posts", title);
            remainingCredits--;
            updateCreditDisplay();
        } else {
            alert("Fehler: " + data.error);
        }
    } catch (error) {
        alert("Server-Fehler bei der Social-Media-Erstellung.");
    } finally {
        btn.disabled = false;
        btn.innerText = "📱 Posts generieren";
    }
}

function exportToWordTable() {
    const text = document.getElementById('exposeText').innerText;
    const title = document.getElementById('title').value || "Immobilien-Exposé";
    const price = document.getElementById('price').value || "-";
    const location = document.getElementById('location').value || "-";

    if (!text || text.includes("bitte warten...")) {
        alert("Es gibt noch kein Exposé zum Exportieren!");
        return;
    }
    
    // Sauberes Tabellen-Layout für Word mit fester Schriftart
    const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://w3.org'>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, Helvetica, sans-serif; color: #000000; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #333333; padding: 10px; text-align: left; vertical-align: top; }
                th { background-color: #f2f2f2; font-weight: bold; width: 25%; }
            </style>
        </head>
        <body>
            <h2>Immobilien-Exposé: ${title}</h2>
            <table>
                <tr><th>Objekt:</th><td>${title}</td></tr>
                <tr><th>Lage:</th><td>${location}</td></tr>
                <tr><th>Kaufpreis:</th><td>${price} EUR</td></tr>
                <tr><th>Exposé-Text:</th><td>${text.replace(/\n/g, '<br>')}</td></tr>
            </table>
        </body>
        </html>
    `;
    
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Expose_" + title.replace(/\s+/g, '_') + ".doc";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
    
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    const text = element.innerText;
    if (!text || text.includes("bitte warten...") || text.includes("KI schreibt...")) {
        alert("Es gibt noch keinen Text zum Kopieren!");
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        alert("📋 Text erfolgreich in Zwischenablage kopiert!");
    }).catch(err => {
        alert("Fehler beim Kopieren.");
    });
}

function saveToHistory(typ, titel) {
    let history = JSON.parse(localStorage.getItem('immoFlowHistory')) || [];
    const eintrag = {
        zeit: new Date().toLocaleTimeString(),
        typ: typ,
        titel: titel
    };
    history.unshift(eintrag);
    if(history.length > 10) history.pop();
    localStorage.setItem('immoFlowHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const box = document.getElementById('historyBox');
    if (!box) return;
    let history = JSON.parse(localStorage.getItem('immoFlowHistory')) || [];
    if (history.length === 0) {
        box.innerHTML = '<p style="color: #9ca3af; font-style: italic;">Noch keine Historie vorhanden...</p>';
        return;
    }
    box.innerHTML = history.map(e => `
        <div style="padding: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 13px;">
            <span style="color: var(--accent); font-weight: bold;">[${e.zeit}]</span> 
            <strong>${e.typ}:</strong> ${e.titel}
        </div>
    `).join('');
}

function clearHistory() {
    localStorage.removeItem('immoFlowHistory');
    renderHistory();
}

// ==========================================
// FEATURE 5: KI-IMMOBILIEN-WERTRECHNER (FRONTEND)
// ==========================================
async function generateValuation() {
    if (remainingCredits <= 0) {
        alert("Keine Credits mehr übrig!");
        return;
    }
    const size = document.getElementById('valSize').value;
    const rooms = document.getElementById('valRooms').value;
    const condition = document.getElementById('valCondition').value;
    const location = document.getElementById('valLocation').value;

    if (!size || !rooms || !location) {
        alert("Bitte fülle Fläche, Zimmer und Ort für die Wertermittlung aus.");
        return;
    }

    const btn = document.getElementById('generateValuationBtn');
    const resultBox = document.getElementById('valuationResultBox');
    const resultText = document.getElementById('valuationText');

    btn.disabled = true;
    btn.innerText = "Berechne Marktwert...";
    resultBox.classList.remove('hidden');
    resultText.innerText = "Die KI analysiert die Daten und berechnet die Expertise, bitte warten...";

    try {
        const response = await fetch('/api/generate-valuation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ size, rooms, condition, location, password: savedPassword })
        });
        const data = await response.json();
        if (data.success) {
            resultText.innerText = data.text;
            saveToHistory("Wertexpertise", location);
            remainingCredits--;
            updateCreditDisplay();
        } else {
            resultText.innerText = "Fehler: " + data.error;
        }
    } catch (error) {
        resultText.innerText = "Server-Fehler bei der Wertermittlung.";
    } finally {
        btn.disabled = false;
        btn.innerText = "💰 Marktwert ermitteln";
    }
}

// ==========================================
// FEATURE 6: KI-OBJEKT-CHECKLISTE (FRONTEND)
// ==========================================
async function generateChecklist() {
    if (remainingCredits <= 0) {
        alert("Keine Credits mehr übrig!");
        return;
    }
    const type = document.getElementById('chkType').value;
    const year = document.getElementById('chkYear').value;
    const condition = document.getElementById('chkCondition').value;

    if (!type || !condition) {
        alert("Bitte fülle mindestens den Objekttyp und den Zustand aus.");
        return;
    }

    const btn = document.getElementById('generateChecklistBtn');
    const resultBox = document.getElementById('checklistResultBox');
    const resultText = document.getElementById('checklistText');

    btn.disabled = true;
    btn.innerText = "Erstelle To-Do-Liste...";
    resultBox.classList.remove('hidden');
    resultText.innerText = "Die KI strukturiert den Verkaufsplan, bitte warten...";

    try {
        const response = await fetch('/api/generate-checklist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, year, condition, password: savedPassword })
        });
        const data = await response.json();
        if (data.success) {
            resultText.innerText = data.text;
            saveToHistory("To-Do-Liste", type);
            remainingCredits--;
            updateCreditDisplay();
        } else {
            resultText.innerText = "Fehler: " + data.error;
        }
    } catch (error) {
        resultText.innerText = "Server-Fehler bei der Checklisten-Erstellung.";
    } finally {
        btn.disabled = false;
        btn.innerText = "📑 To-Do-Liste generieren";
    }
}

// ==========================================
// FEATURE 7: KI-LAGE-BESCHREIBER (FRONTEND)
// ==========================================
async function generateLocationDesc() {
    if (remainingCredits <= 0) {
        alert("Keine Credits mehr übrig!");
        return;
    }
    const location = document.getElementById('locName').value;
    const targetGroup = document.getElementById('locTarget').value;

    if (!location || !targetGroup) {
        alert("Bitte fülle den Ort und die Zielgruppe für die Lagebeschreibung aus.");
        return;
    }

    const btn = document.getElementById('generateLocationBtn');
    const resultBox = document.getElementById('locationResultBox');
    const resultText = document.getElementById('locationText');

    btn.disabled = true;
    btn.innerText = "Analysiere Lage...";
    resultBox.classList.remove('hidden');
    resultText.innerText = "Die KI sammelt Standort-Highlights, bitte warten...";

    try {
        const response = await fetch('/api/generate-location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location, targetGroup, password: savedPassword })
        });
        const data = await response.json();
        if (data.success) {
            resultText.innerText = data.text;
            saveToHistory("Lagebeschreibung", location);
            remainingCredits--;
            updateCreditDisplay();
        } else {
            resultText.innerText = "Fehler: " + data.error;
        }
    } catch (error) {
        resultText.innerText = "Server-Fehler bei der Lageanalyse.";
    } finally {
        btn.disabled = false;
        btn.innerText = "🗺️ Lagebeschreibung generieren";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
    const imgBtn = document.getElementById('analyzeImageBtn');
    if (imgBtn) {
        imgBtn.addEventListener('click', analyzeImage);
    }

    // ==========================================
// UNIVERSELLE WORD-EXPORT-MASCHINE FOR ALLES
// ==========================================
function exportAnyToWord(elementId, dateiName) {
    const textElement = document.getElementById(elementId);
    if (!textElement) return;
    const text = textElement.innerText;
    
    if (!text || text.includes("bitte warten...") || text.includes("KI schreibt...")) {
        alert("Es gibt noch keinen Text zum Exportieren!");
        return;
    }
    
    // Generiert ein sauberes Word-Dokument in Arial/Helvetica für jedes Feature
    const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://w3.org'>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, Helvetica, sans-serif; color: #000000; line-height: 1.6; padding: 20px; }
                h1 { color: #10b981; font-size: 22px; border-bottom: 2px solid #10b981; padding-bottom: 8px; font-family: Arial, sans-serif; }
                .content-box { font-family: Arial, sans-serif; font-size: 11pt; white-space: pre-wrap; margin-top: 15px; }
            </style>
        </head>
        <body>
            <h1>📄 ImmoFlow Expertise: ${dateiName.replace(/_/g, ' ')}</h1>
            <div class="content-box">${text.replace(/\n/g, '<br>')}</div>
        </body>
        </html>
    `;
    
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = dateiName + "_" + new Date().toLocaleDateString('de-DE').replace(/\./g, '-') + ".doc";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==========================================
// FEATURE 8: KI-VERTRAGS-PRÜFER (FRONTEND)
// ==========================================
async function analyzeContract() {
    if (remainingCredits <= 0) {
        alert("Keine Credits mehr übrig!");
        return;
    }
    const contractText = document.getElementById('contractTextInput').value;

    if (!contractText || !contractText.trim()) {
        alert("Bitte kopiere zuerst einen Vertragstext oder eine Klausel in das Feld.");
        return;
    }

    const btn = document.getElementById('analyzeContractBtn');
    const resultBox = document.getElementById('contractResultBox');
    const resultText = document.getElementById('contractText');

    btn.disabled = true;
    btn.innerText = "Prüfe Vertragstext...";
    resultBox.classList.remove('hidden');
    resultText.innerText = "Der KI-Rechtsexperte scannt die Klauseln auf Stolperfallen, bitte warten...";

    try {
        const response = await fetch('/api/analyze-contract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contractText, password: savedPassword })
        });
        const data = await response.json();
        if (data.success) {
            resultText.innerText = data.text;
            saveToHistory("Vertragsprüfung", "Klausel-Check");
            remainingCredits--;
            updateCreditDisplay();
        } else {
            resultText.innerText = "Fehler: " + data.error;
        }
    } catch (error) {
        resultText.innerText = "Server-Fehler bei der Vertragsanalyse.";
    } finally {
        btn.disabled = false;
        btn.innerText = "📑 Vertrag prüfen";
    }
}

// ==========================================
// FEATURE 9: KI-KUNDEN-PROFIL-MATCHING (FRONTEND)
// ==========================================
async function matchProfile() {
    if (remainingCredits <= 0) {
        alert("Keine Credits mehr übrig!");
        return;
    }
    const buyerCriteria = document.getElementById('buyerCriteriaInput').value;
    
    // Hier greifen wir uns automatisch die Objektdaten von ganz oben ab:
    const propTitle = document.getElementById('title').value;
    const propPrice = document.getElementById('price').value;
    const propLocation = document.getElementById('location').value;
    const propNotes = document.getElementById('notes').value;

    if (!buyerCriteria || !buyerCriteria.trim()) {
        alert("Bitte gib zuerst die Suchkriterien des Kunden ein.");
        return;
    }
    if (!propTitle || !propPrice || !propLocation) {
        alert("Bitte fülle zuerst Objekttitel, Kaufpreis und Ort ganz oben im Exposé-Generator aus, damit die KI die Daten matchen kann.");
        return;
    }

    const btn = document.getElementById('matchProfileBtn');
    const resultBox = document.getElementById('matchResultBox');
    const resultText = document.getElementById('matchText');

    btn.disabled = true;
    btn.innerText = "Abgleich läuft...";
    resultBox.classList.remove('hidden');
    resultText.innerText = "Die KI vergleicht das Kundenprofil mit deinem Objekt und verfasst die Einladung, bitte warten...";

    try {
        const response = await fetch('/api/match-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                buyerCriteria, 
                propTitle, 
                propPrice, 
                propLocation, 
                propNotes, 
                password: savedPassword 
            })
        });
        const data = await response.json();
        if (data.success) {
            resultText.innerText = data.text;
            saveToHistory("Kunden-Matching", propTitle);
            remainingCredits--;
            updateCreditDisplay();
        } else {
            resultText.innerText = "Fehler: " + data.error;
        }
    } catch (error) {
        resultText.innerText = "Server-Fehler beim Kunden-Matching.";
    } finally {
        btn.disabled = false;
        btn.innerText = "👥 Kunden-Matching starten";
    }
}

});
