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
    
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // 🎯 Hier sauber korrigiert ohne die störenden Schrägstriche:
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

document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
    const imgBtn = document.getElementById('analyzeImageBtn');
    if (imgBtn) {
        imgBtn.addEventListener('click', analyzeImage);
    }
});
