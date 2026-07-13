/* ============================================================
   NetDeep - app.js
   Logique JavaScript complète de l'application
   Dépend de data.js (coursesData, devicesData, enterpriseData,
   securityData, windowsData, osiData)
   ============================================================ */

// ============================================================
// 1. MATRIX CANVAS ANIMATION
// ============================================================

/**
 * Initialise l'animation Matrix (pluie de caractères verts)
 * sur le canvas #matrix-bg
 */
function initMatrixAnimation() {
    const canvas = document.getElementById('matrix-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Adapter le canvas à la taille de la fenêtre
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Caractères utilisés pour l'animation
    const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~`ァカサタナハマヤラワンアイウエオ';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    function drawMatrix() {
        // Fond semi-transparent pour effet de traînée
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Couleur verte Matrix
        ctx.fillStyle = '#0f0';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);

            // Réinitialiser la colonne aléatoirement
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    // Boucle d'animation ~30fps
    setInterval(drawMatrix, 35);
}


// ============================================================
// 2. TAB MANAGEMENT
// ============================================================

/** Tab actuellement active */
let currentTab = 'accueil';

/**
 * Bascule vers l'onglet spécifié
 * @param {string} tabId - L'ID de l'onglet à afficher
 */
function switchTab(tabId) {
    // Cacher tous les contenus d'onglet
    const allTabs = document.querySelectorAll('.tab-content');
    allTabs.forEach(tab => {
        tab.classList.remove('active', 'fadeIn');
        tab.style.display = 'none';
    });

    // Afficher l'onglet sélectionné avec animation
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.style.display = 'block';
        // Forcer le reflow pour déclencher l'animation
        void selectedTab.offsetWidth;
        selectedTab.classList.add('active', 'fadeIn');
    }

    // Mettre à jour la navigation active
    const navItems = document.querySelectorAll('.nav-item, .sidebar-link');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tabId) {
            item.classList.add('active');
        }
    });

    currentTab = tabId;

    // Actions spécifiques par onglet
    switch (tabId) {
        case 'accueil':
            loadDashboard();
            break;
        case 'cours':
            renderCourses();
            break;
        case 'appareils':
            renderDevices();
            break;
        case 'entreprise':
            renderEnterprise();
            break;
        case 'securite':
            renderSecurity();
            break;
        case 'windows':
            renderWindows();
            break;
        case 'osi':
            renderOSI();
            break;
    }
}

/**
 * Attache les event listeners sur les éléments de navigation
 */
function initTabNavigation() {
    const navItems = document.querySelectorAll('[data-tab]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.dataset.tab;
            if (tabId) {
                switchTab(tabId);
                // Fermer la sidebar mobile si ouverte
                closeMobileSidebar();
            }
        });
    });
}


// ============================================================
// 3. DASHBOARD APIs (Tab Accueil)
// ============================================================

/** Flag pour éviter les chargements multiples */
let dashboardLoaded = false;

/**
 * Charge les données du dashboard depuis les APIs Cloudflare
 */
async function loadDashboard() {
    if (dashboardLoaded) return;

    const dashboardEl = document.getElementById('dashboard-cards');
    if (!dashboardEl) return;

    showLoading('dashboard-cards');

    try {
        // Appels parallèles aux APIs Cloudflare
        const [traceResponse, metaResponse, timeResponse] = await Promise.allSettled([
            fetch('https://one.one.one.one/cdn-cgi/trace'),
            fetch('https://speed.cloudflare.com/meta'),
            fetch('https://worldtimeapi.org/api/ip')
        ]);

        let traceData = {};
        let metaData = {};
        let timeData = {};

        // Parser Cloudflare Trace (format texte key=value)
        if (traceResponse.status === 'fulfilled' && traceResponse.value.ok) {
            const traceText = await traceResponse.value.text();
            traceText.split('\n').forEach(line => {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    traceData[key.trim()] = valueParts.join('=').trim();
                }
            });
        }

        // Parser Cloudflare Speed Meta (JSON)
        if (metaResponse.status === 'fulfilled' && metaResponse.value.ok) {
            metaData = await metaResponse.value.json();
        }

        // Parser WorldTimeAPI (JSON)
        if (timeResponse.status === 'fulfilled' && timeResponse.value.ok) {
            timeData = await timeResponse.value.json();
        }

        // Construire les cartes du dashboard
        const cards = [
            {
                icon: '🌐',
                title: 'Adresse IP',
                value: traceData.ip || metaData.clientIp || 'N/A',
                detail: `Version: ${traceData.ts ? 'IPv' + (traceData.ip && traceData.ip.includes(':') ? '6' : '4') : 'N/A'}`
            },
            {
                icon: '📍',
                title: 'Localisation',
                value: `${metaData.city || 'N/A'}, ${metaData.country || traceData.loc || 'N/A'}`,
                detail: `Lat: ${metaData.latitude || 'N/A'} | Lon: ${metaData.longitude || 'N/A'}`
            },
            {
                icon: '🏢',
                title: 'FAI / ASN',
                value: metaData.asOrganization || 'N/A',
                detail: `ASN: ${metaData.asn || traceData.asn || 'N/A'}`
            },
            {
                icon: '🔒',
                title: 'TLS / HTTP',
                value: `TLS: ${traceData.tls || 'N/A'}`,
                detail: `HTTP: ${traceData.http || 'N/A'} | WARP: ${traceData.warp || 'off'}`
            },
            {
                icon: '🖥️',
                title: 'Data Center',
                value: `Colo: ${traceData.colo || metaData.colo || 'N/A'}`,
                detail: `Gateway: ${traceData.gateway || 'N/A'}`
            },
            {
                icon: '🕐',
                title: 'Heure',
                value: timeData.datetime ? new Date(timeData.datetime).toLocaleTimeString('fr-FR') : new Date().toLocaleTimeString('fr-FR'),
                detail: `Timezone: ${timeData.timezone || traceData.uag || Intl.DateTimeFormat().resolvedOptions().timeZone}`
            }
        ];

        dashboardEl.innerHTML = cards.map(card => `
            <div class="dashboard-card">
                <div class="card-icon">${card.icon}</div>
                <div class="card-content">
                    <h3 class="card-title">${card.title}</h3>
                    <p class="card-value">${sanitizeHTML(card.value)}</p>
                    <p class="card-detail">${sanitizeHTML(card.detail)}</p>
                </div>
            </div>
        `).join('');

        dashboardLoaded = true;

    } catch (error) {
        showError('dashboard-cards', `Erreur lors du chargement du dashboard: ${error.message}`);
    }
}


// ============================================================
// 4. DIAGNOSTICS RÉSEAU (Globalping API)
// ============================================================

/** État courant du diagnostic */
let diagnosticInProgress = false;

/**
 * Exécute un diagnostic réseau via Globalping API
 * @param {string} type - Type de diagnostic: ping, traceroute, dns, mtr
 * @param {string} target - Cible (domaine ou IP)
 * @param {string} country - Code pays ISO (ex: FR, US, DE)
 */
async function executeDiagnostic(type, target, country) {
    if (diagnosticInProgress) {
        showError('diagnostic-results', 'Un diagnostic est déjà en cours. Veuillez patienter.');
        return;
    }

    if (!target || !target.trim()) {
        showError('diagnostic-results', 'Veuillez entrer une cible valide (domaine ou IP).');
        return;
    }

    const validTypes = ['ping', 'traceroute', 'dns', 'mtr'];
    if (!validTypes.includes(type)) {
        showError('diagnostic-results', `Type de diagnostic invalide: ${type}. Utilisez: ${validTypes.join(', ')}`);
        return;
    }

    diagnosticInProgress = true;
    showLoading('diagnostic-results');

    try {
        // POST pour créer la mesure
        const body = {
            type: type,
            target: target.trim(),
            locations: [{ country: country || 'FR' }],
            limit: 1
        };

        // Ajouter le protocole pour DNS
        if (type === 'dns') {
            body.measurementOptions = { query: { type: 'A' } };
        }

        const createResponse = await fetch('https://api.globalping.io/v1/measurements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!createResponse.ok) {
            const errorData = await createResponse.json().catch(() => ({}));
            throw new Error(errorData.message || `Erreur API: ${createResponse.status} ${createResponse.statusText}`);
        }

        const createData = await createResponse.json();
        const measurementId = createData.id;

        if (!measurementId) {
            throw new Error('ID de mesure non reçu');
        }

        // Polling jusqu'à ce que la mesure soit terminée
        let result = null;
        let attempts = 0;
        const maxAttempts = 30; // Max 30 tentatives (30 secondes)

        while (attempts < maxAttempts) {
            await sleep(1000);
            attempts++;

            const pollResponse = await fetch(`https://api.globalping.io/v1/measurements/${measurementId}`);
            if (!pollResponse.ok) {
                throw new Error(`Erreur lors du polling: ${pollResponse.status}`);
            }

            result = await pollResponse.json();

            if (result.status === 'finished') {
                break;
            }

            // Mettre à jour le statut du chargement
            updateLoadingMessage('diagnostic-results', `Diagnostic en cours... (${attempts}s)`);
        }

        if (!result || result.status !== 'finished') {
            throw new Error('Le diagnostic a expiré (timeout). Réessayez.');
        }

        // Formater et afficher les résultats
        displayDiagnosticResults(type, target, country, result);

    } catch (error) {
        showError('diagnostic-results', `Erreur diagnostic: ${error.message}`);
    } finally {
        diagnosticInProgress = false;
    }
}

/**
 * Affiche les résultats d'un diagnostic formatés
 */
function displayDiagnosticResults(type, target, country, result) {
    const container = document.getElementById('diagnostic-results');
    if (!container) return;

    const probeResult = result.results && result.results[0];
    if (!probeResult) {
        showError('diagnostic-results', 'Aucun résultat disponible.');
        return;
    }

    const probe = probeResult.probe || {};
    const resultData = probeResult.result || {};

    let html = `
        <div class="diagnostic-result">
            <div class="result-header">
                <h3>📊 ${type.toUpperCase()} → ${sanitizeHTML(target)}</h3>
                <span class="result-badge">${probe.country || country} - ${probe.city || 'N/A'}</span>
                <span class="result-badge">${probe.asn ? 'AS' + probe.asn : ''} ${probe.network || ''}</span>
            </div>
            <div class="result-body">
    `;

    switch (type) {
        case 'ping':
            html += formatPingResult(resultData);
            break;
        case 'traceroute':
            html += formatTracerouteResult(resultData);
            break;
        case 'dns':
            html += formatDnsResult(resultData);
            break;
        case 'mtr':
            html += formatMtrResult(resultData);
            break;
    }

    html += `
            </div>
            <div class="result-footer">
                <small>Sonde: ${probe.city || 'N/A'}, ${probe.country || 'N/A'} | ISP: ${probe.network || 'N/A'}</small>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Formate les résultats ping
 */
function formatPingResult(data) {
    const stats = data.stats || {};
    const timings = data.timings || [];

    let html = `
        <div class="ping-stats">
            <div class="stat-item"><span class="stat-label">Min</span><span class="stat-value">${stats.min || 'N/A'} ms</span></div>
            <div class="stat-item"><span class="stat-label">Avg</span><span class="stat-value">${stats.avg || 'N/A'} ms</span></div>
            <div class="stat-item"><span class="stat-label">Max</span><span class="stat-value">${stats.max || 'N/A'} ms</span></div>
            <div class="stat-item"><span class="stat-label">Perte</span><span class="stat-value">${stats.loss || 0}%</span></div>
        </div>
    `;

    if (timings.length > 0) {
        html += `<div class="ping-details"><pre>`;
        timings.forEach((t, i) => {
            html += `Seq ${i + 1}: TTL=${t.ttl || 'N/A'} RTT=${t.rtt || 'N/A'} ms\n`;
        });
        html += `</pre></div>`;
    }

    // Afficher la sortie raw si disponible
    if (data.rawOutput) {
        html += `<pre class="raw-output">${sanitizeHTML(data.rawOutput)}</pre>`;
    }

    return html;
}

/**
 * Formate les résultats traceroute
 */
function formatTracerouteResult(data) {
    const hops = data.hops || [];

    if (hops.length === 0 && data.rawOutput) {
        return `<pre class="raw-output">${sanitizeHTML(data.rawOutput)}</pre>`;
    }

    let html = '<table class="result-table"><thead><tr><th>Hop</th><th>Hôte</th><th>IP</th><th>RTT</th></tr></thead><tbody>';

    hops.forEach(hop => {
        const timings = hop.timings || [];
        const rtt = timings.length > 0 ? timings.map(t => `${t.rtt}ms`).join(' / ') : '*';
        html += `
            <tr>
                <td>${hop.hop || '*'}</td>
                <td>${sanitizeHTML(hop.resolvedHostname || hop.resolvedAddress || '*')}</td>
                <td>${sanitizeHTML(hop.resolvedAddress || '*')}</td>
                <td>${rtt}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';

    if (data.rawOutput) {
        html += `<details><summary>Sortie brute</summary><pre class="raw-output">${sanitizeHTML(data.rawOutput)}</pre></details>`;
    }

    return html;
}

/**
 * Formate les résultats DNS
 */
function formatDnsResult(data) {
    const answers = data.answers || [];

    if (answers.length === 0 && data.rawOutput) {
        return `<pre class="raw-output">${sanitizeHTML(data.rawOutput)}</pre>`;
    }

    let html = '<table class="result-table"><thead><tr><th>Nom</th><th>Type</th><th>TTL</th><th>Valeur</th></tr></thead><tbody>';

    answers.forEach(answer => {
        html += `
            <tr>
                <td>${sanitizeHTML(answer.name || '')}</td>
                <td>${sanitizeHTML(answer.type || '')}</td>
                <td>${answer.ttl || 'N/A'}</td>
                <td>${sanitizeHTML(answer.value || '')}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';

    if (data.rawOutput) {
        html += `<details><summary>Sortie brute</summary><pre class="raw-output">${sanitizeHTML(data.rawOutput)}</pre></details>`;
    }

    return html;
}

/**
 * Formate les résultats MTR
 */
function formatMtrResult(data) {
    const hops = data.hops || [];

    if (hops.length === 0 && data.rawOutput) {
        return `<pre class="raw-output">${sanitizeHTML(data.rawOutput)}</pre>`;
    }

    let html = '<table class="result-table"><thead><tr><th>Hop</th><th>Hôte</th><th>Perte%</th><th>Envoyés</th><th>Avg</th><th>Best</th><th>Worst</th><th>StDev</th></tr></thead><tbody>';

    hops.forEach(hop => {
        const stats = hop.stats || {};
        html += `
            <tr>
                <td>${hop.hop || '*'}</td>
                <td>${sanitizeHTML(hop.resolvedHostname || hop.resolvedAddress || '*')}</td>
                <td>${stats.loss || 0}%</td>
                <td>${stats.sent || 'N/A'}</td>
                <td>${stats.avg || 'N/A'} ms</td>
                <td>${stats.best || 'N/A'} ms</td>
                <td>${stats.worst || 'N/A'} ms</td>
                <td>${stats.stDev || 'N/A'}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';

    if (data.rawOutput) {
        html += `<details><summary>Sortie brute</summary><pre class="raw-output">${sanitizeHTML(data.rawOutput)}</pre></details>`;
    }

    return html;
}

/**
 * Initialise les boutons de diagnostic
 */
function initDiagnostics() {
    const diagForm = document.getElementById('diagnostic-form');
    if (!diagForm) return;

    diagForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('diag-type')?.value || 'ping';
        const target = document.getElementById('diag-target')?.value || '';
        const country = document.getElementById('diag-country')?.value || 'FR';
        executeDiagnostic(type, target, country);
    });

    // Boutons rapides de diagnostic
    const quickButtons = document.querySelectorAll('[data-diag-type]');
    quickButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.diagType;
            const target = document.getElementById('diag-target')?.value || '';
            const country = document.getElementById('diag-country')?.value || 'FR';
            if (target) {
                executeDiagnostic(type, target, country);
            } else {
                showError('diagnostic-results', 'Veuillez entrer une cible.');
            }
        });
    });
}


// ============================================================
// 5. IP INFO & RÉPUTATION
// ============================================================

/**
 * Recherche les informations complètes d'une adresse IP
 * @param {string} ip - Adresse IP à analyser
 */
async function lookupIPInfo(ip) {
    if (!ip || !ip.trim()) {
        showError('ip-results', 'Veuillez entrer une adresse IP valide.');
        return;
    }

    ip = ip.trim();
    showLoading('ip-results');

    try {
        // Appels parallèles aux différentes APIs
        const [ipinfoRes, ipApiRes, shodanRes, abuseRes] = await Promise.allSettled([
            fetch(`https://ipinfo.io/${ip}/json`),
            fetch(`http://ip-api.com/json/${ip}`),
            fetch(`https://internetdb.shodan.io/${ip}`),
            fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}`, {
                headers: {
                    'Accept': 'application/json',
                    'Key': '' // Clé API optionnelle
                }
            })
        ]);

        let ipinfoData = null;
        let ipApiData = null;
        let shodanData = null;
        let abuseData = null;

        // Parser IPinfo
        if (ipinfoRes.status === 'fulfilled' && ipinfoRes.value.ok) {
            ipinfoData = await ipinfoRes.value.json();
        }

        // Parser ip-api.com
        if (ipApiRes.status === 'fulfilled' && ipApiRes.value.ok) {
            ipApiData = await ipApiRes.value.json();
        }

        // Parser Shodan InternetDB
        if (shodanRes.status === 'fulfilled' && shodanRes.value.ok) {
            shodanData = await shodanRes.value.json();
        }

        // Parser AbuseIPDB
        if (abuseRes.status === 'fulfilled' && abuseRes.value.ok) {
            try {
                abuseData = await abuseRes.value.json();
                abuseData = abuseData.data || abuseData;
            } catch (e) {
                abuseData = null;
            }
        }

        displayIPResults(ip, ipinfoData, ipApiData, shodanData, abuseData);

    } catch (error) {
        showError('ip-results', `Erreur lors de la recherche IP: ${error.message}`);
    }
}

/**
 * Affiche les résultats de la recherche IP en cartes formatées
 */
function displayIPResults(ip, ipinfo, ipApi, shodan, abuse) {
    const container = document.getElementById('ip-results');
    if (!container) return;

    let html = `<div class="ip-results-grid">`;

    // ── Carte IPinfo ──
    html += `
        <div class="info-card">
            <div class="info-card-header">
                <span class="info-icon">📍</span>
                <h4>IPinfo.io</h4>
            </div>
            <div class="info-card-body">
    `;
    if (ipinfo) {
        html += `
            <div class="info-row"><span class="info-label">IP</span><span class="info-value">${sanitizeHTML(ipinfo.ip || ip)}</span></div>
            <div class="info-row"><span class="info-label">Hostname</span><span class="info-value">${sanitizeHTML(ipinfo.hostname || 'N/A')}</span></div>
            <div class="info-row"><span class="info-label">Ville</span><span class="info-value">${sanitizeHTML(ipinfo.city || 'N/A')}</span></div>
            <div class="info-row"><span class="info-label">Région</span><span class="info-value">${sanitizeHTML(ipinfo.region || 'N/A')}</span></div>
            <div class="info-row"><span class="info-label">Pays</span><span class="info-value">${sanitizeHTML(ipinfo.country || 'N/A')}</span></div>
            <div class="info-row"><span class="info-label">Localisation</span><span class="info-value">${sanitizeHTML(ipinfo.loc || 'N/A')}</span></div>
            <div class="info-row"><span class="info-label">Org</span><span class="info-value">${sanitizeHTML(ipinfo.org || 'N/A')}</span></div>
            <div class="info-row"><span class="info-label">Postal</span><span class="info-value">${sanitizeHTML(ipinfo.postal || 'N/A')}</span></div>
            <div class="info-row"><span class="info-label">Timezone</span><span class="info-value">${sanitizeHTML(ipinfo.timezone || 'N/A')}</span></div>
        `;
    } else {
        html += `<p class="info-error">Données IPinfo non disponibles</p>`;
    }
    html += `</div></div>`;

    // ── Carte ip-api.com ──
    html += `
        <div class="info-card">
            <div class="info-card-header">
                <span class="info-icon">🌍</span>
                <h4>ip-api.com</h4>
            </div>
            <div class="info-card-body">
    `;
    if (ipApi && ipApi.status === 'success') {
        html += `
            <div class="info-row"><span class="info-label">Pays</span><span class="info-value">${sanitizeHTML(ipApi.country || 'N/A')} (${sanitizeHTML(ipApi.countryCode || '')})</span></div>
            <div class="info-row"><span class="info-label">Région</span><span class="info-value">${sanitizeHTML(ipApi.regionName || 'N/A')} (${sanitizeHTML(ipApi.region || '')})</span></div>
            <div class="info-row"><span class="info-label">Ville</span><span class="info-value">${sanitizeHTML(ipApi.city || 'N/A')}</span></div>
            <div class="info-row"><span class="info-label">ZIP</span><span class="info-value">${sanitizeHTML(ipApi.zip || 'N/A')}</span></div>
            <div class="info-row"><span class="info-label">Lat/Lon</span><span class="info-value">${ipApi.lat || 'N/A'}, ${ipApi.lon || 'N/A'}</span></div>
            <div class="info-row"><span class="info-label">ISP</span><span class="info-value">${sanitizeHTML(ipApi.isp || 'N/A')}</span></div>
            <div class="info-row"><span class="info-label">Org</span><span class="info-value">${sanitizeHTML(ipApi.org || 'N/A')}</span></div>
            <div class="info-row"><span class="info-label">AS</span><span class="info-value">${sanitizeHTML(ipApi.as || 'N/A')}</span></div>
            <div class="info-row"><span class="info-label">Mobile</span><span class="info-value">${ipApi.mobile ? '✅ Oui' : '❌ Non'}</span></div>
            <div class="info-row"><span class="info-label">Proxy</span><span class="info-value">${ipApi.proxy ? '⚠️ Oui' : '❌ Non'}</span></div>
            <div class="info-row"><span class="info-label">Hosting</span><span class="info-value">${ipApi.hosting ? '🖥️ Oui' : '❌ Non'}</span></div>
        `;
    } else {
        html += `<p class="info-error">Données ip-api non disponibles${ipApi?.message ? ': ' + sanitizeHTML(ipApi.message) : ''}</p>`;
    }
    html += `</div></div>`;

    // ── Carte Shodan InternetDB ──
    html += `
        <div class="info-card">
            <div class="info-card-header">
                <span class="info-icon">🔍</span>
                <h4>Shodan InternetDB</h4>
            </div>
            <div class="info-card-body">
    `;
    if (shodan && !shodan.detail) {
        const ports = (shodan.ports || []).join(', ') || 'Aucun';
        const vulns = (shodan.vulns || []).join(', ') || 'Aucune';
        const hostnames = (shodan.hostnames || []).join(', ') || 'Aucun';
        const cpes = (shodan.cpes || []).join(', ') || 'Aucun';
        const tags = (shodan.tags || []).join(', ') || 'Aucun';

        html += `
            <div class="info-row"><span class="info-label">Ports ouverts</span><span class="info-value ports-list">${sanitizeHTML(ports)}</span></div>
            <div class="info-row"><span class="info-label">Vulnérabilités</span><span class="info-value vuln-list ${(shodan.vulns || []).length > 0 ? 'has-vulns' : ''}">${sanitizeHTML(vulns)}</span></div>
            <div class="info-row"><span class="info-label">Hostnames</span><span class="info-value">${sanitizeHTML(hostnames)}</span></div>
            <div class="info-row"><span class="info-label">CPEs</span><span class="info-value">${sanitizeHTML(cpes)}</span></div>
            <div class="info-row"><span class="info-label">Tags</span><span class="info-value">${sanitizeHTML(tags)}</span></div>
        `;
    } else {
        html += `<p class="info-error">Données Shodan non disponibles${shodan?.detail ? ': ' + sanitizeHTML(shodan.detail) : ''}</p>`;
    }
    html += `</div></div>`;

    // ── Carte AbuseIPDB ──
    html += `
        <div class="info-card">
            <div class="info-card-header">
                <span class="info-icon">🛡️</span>
                <h4>AbuseIPDB Réputation</h4>
            </div>
            <div class="info-card-body">
    `;
    if (abuse && abuse.ipAddress) {
        const score = abuse.abuseConfidenceScore || 0;
        const scoreClass = score > 75 ? 'danger' : score > 25 ? 'warning' : 'safe';

        html += `
            <div class="info-row"><span class="info-label">Score d'abus</span><span class="info-value score-${scoreClass}">${score}%</span></div>
            <div class="info-row"><span class="info-label">Rapports</span><span class="info-value">${abuse.totalReports || 0}</span></div>
            <div class="info-row"><span class="info-label">Utilisateurs distincts</span><span class="info-value">${abuse.numDistinctUsers || 0}</span></div>
            <div class="info-row"><span class="info-label">Pays</span><span class="info-value">${sanitizeHTML(abuse.countryCode || 'N/A')}</span></div>
            <div class="info-row"><span class="info-label">ISP</span><span class="info-value">${sanitizeHTML(abuse.isp || 'N/A')}</span></div>
            <div class="info-row"><span class="info-label">Domaine</span><span class="info-value">${sanitizeHTML(abuse.domain || 'N/A')}</span></div>
            <div class="info-row"><span class="info-label">Type</span><span class="info-value">${sanitizeHTML(abuse.usageType || 'N/A')}</span></div>
            <div class="info-row"><span class="info-label">Whitelist</span><span class="info-value">${abuse.isWhitelisted ? '✅ Oui' : '❌ Non'}</span></div>
            <div class="info-row"><span class="info-label">Dernier signalement</span><span class="info-value">${abuse.lastReportedAt ? new Date(abuse.lastReportedAt).toLocaleDateString('fr-FR') : 'N/A'}</span></div>
        `;
    } else {
        html += `<p class="info-error">Données AbuseIPDB non disponibles (clé API requise)</p>`;
    }
    html += `</div></div>`;

    html += `</div>`; // Fin ip-results-grid

    container.innerHTML = html;
}

/**
 * Initialise le formulaire de recherche IP
 */
function initIPLookup() {
    const ipForm = document.getElementById('ip-lookup-form');
    if (!ipForm) return;

    ipForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const ip = document.getElementById('ip-input')?.value || '';
        lookupIPInfo(ip);
    });
}


// ============================================================
// 6. RECHERCHE DNS (Google DNS over HTTPS + RIPE)
// ============================================================

/**
 * Effectue une recherche DNS via Google DNS over HTTPS
 * @param {string} domain - Nom de domaine à résoudre
 * @param {string} type - Type d'enregistrement: A, AAAA, MX, TXT, NS, CNAME, SOA
 */
async function lookupDNS(domain, type) {
    if (!domain || !domain.trim()) {
        showError('dns-results', 'Veuillez entrer un nom de domaine valide.');
        return;
    }

    domain = domain.trim();
    type = type || 'A';
    const validTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA'];

    if (!validTypes.includes(type.toUpperCase())) {
        showError('dns-results', `Type DNS invalide: ${type}. Utilisez: ${validTypes.join(', ')}`);
        return;
    }

    showLoading('dns-results');

    try {
        // Appels parallèles: Google DNS + RIPE DNS Chain
        const [googleRes, ripeRes] = await Promise.allSettled([
            fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type.toUpperCase()}`),
            fetch(`https://stat.ripe.net/data/dns-chain/data.json?resource=${encodeURIComponent(domain)}`)
        ]);

        let googleData = null;
        let ripeData = null;

        if (googleRes.status === 'fulfilled' && googleRes.value.ok) {
            googleData = await googleRes.value.json();
        }

        if (ripeRes.status === 'fulfilled' && ripeRes.value.ok) {
            ripeData = await ripeRes.value.json();
        }

        displayDNSResults(domain, type, googleData, ripeData);

    } catch (error) {
        showError('dns-results', `Erreur DNS: ${error.message}`);
    }
}

/**
 * Affiche les résultats DNS en table formatée
 */
function displayDNSResults(domain, type, googleData, ripeData) {
    const container = document.getElementById('dns-results');
    if (!container) return;

    let html = '';

    // ── Résultats Google DNS ──
    html += `
        <div class="dns-section">
            <h4>🔎 Google DNS - ${sanitizeHTML(domain)} (${type})</h4>
    `;

    if (googleData) {
        // Statut de la requête
        const statusMap = {
            0: 'NOERROR', 1: 'FORMERR', 2: 'SERVFAIL',
            3: 'NXDOMAIN', 4: 'NOTIMP', 5: 'REFUSED'
        };
        const status = statusMap[googleData.Status] || `Code: ${googleData.Status}`;

        html += `<p class="dns-status">Statut: <strong>${status}</strong> | 
                  RD: ${googleData.RD ? '✅' : '❌'} | 
                  RA: ${googleData.RA ? '✅' : '❌'} | 
                  AD: ${googleData.AD ? '✅ (DNSSEC validé)' : '❌'} | 
                  CD: ${googleData.CD ? '✅' : '❌'}</p>`;

        const answers = googleData.Answer || [];
        if (answers.length > 0) {
            html += `
                <table class="result-table">
                    <thead><tr><th>Nom</th><th>Type</th><th>TTL</th><th>Données</th></tr></thead>
                    <tbody>
            `;
            answers.forEach(answer => {
                const typeName = dnsTypeToString(answer.type);
                html += `
                    <tr>
                        <td>${sanitizeHTML(answer.name || '')}</td>
                        <td><span class="dns-type-badge">${typeName}</span></td>
                        <td>${answer.TTL || 'N/A'}</td>
                        <td class="dns-data">${sanitizeHTML(answer.data || '')}</td>
                    </tr>
                `;
            });
            html += `</tbody></table>`;
        } else {
            html += `<p class="info-error">Aucun enregistrement ${type} trouvé pour ce domaine.</p>`;
        }

        // Authority section
        const authority = googleData.Authority || [];
        if (authority.length > 0) {
            html += `<h5>Authority</h5><table class="result-table"><thead><tr><th>Nom</th><th>Type</th><th>TTL</th><th>Données</th></tr></thead><tbody>`;
            authority.forEach(auth => {
                html += `<tr><td>${sanitizeHTML(auth.name || '')}</td><td>${dnsTypeToString(auth.type)}</td><td>${auth.TTL || 'N/A'}</td><td>${sanitizeHTML(auth.data || '')}</td></tr>`;
            });
            html += `</tbody></table>`;
        }
    } else {
        html += `<p class="info-error">Données Google DNS non disponibles.</p>`;
    }

    html += `</div>`;

    // ── Résultats RIPE DNS Chain ──
    html += `
        <div class="dns-section">
            <h4>🔗 RIPE DNS Chain</h4>
    `;

    if (ripeData && ripeData.data) {
        const chainData = ripeData.data;
        if (chainData.forward_nodes) {
            html += `<h5>Forward Nodes</h5>`;
            html += `<pre class="json-output">${formatJSON(chainData.forward_nodes)}</pre>`;
        }
        if (chainData.reverse_nodes) {
            html += `<h5>Reverse Nodes</h5>`;
            html += `<pre class="json-output">${formatJSON(chainData.reverse_nodes)}</pre>`;
        }
        if (chainData.nameservers) {
            html += `<h5>Nameservers</h5>`;
            html += `<ul class="dns-ns-list">`;
            (Array.isArray(chainData.nameservers) ? chainData.nameservers : Object.keys(chainData.nameservers)).forEach(ns => {
                html += `<li>${sanitizeHTML(typeof ns === 'string' ? ns : JSON.stringify(ns))}</li>`;
            });
            html += `</ul>`;
        }
    } else {
        html += `<p class="info-error">Données RIPE DNS Chain non disponibles.</p>`;
    }

    html += `</div>`;

    container.innerHTML = html;
}

/**
 * Convertit un code de type DNS numérique en chaîne lisible
 * @param {number} typeCode - Code numérique du type DNS
 * @returns {string} Nom du type DNS
 */
function dnsTypeToString(typeCode) {
    const types = {
        1: 'A', 2: 'NS', 5: 'CNAME', 6: 'SOA',
        15: 'MX', 16: 'TXT', 28: 'AAAA', 33: 'SRV',
        43: 'DS', 46: 'RRSIG', 47: 'NSEC', 48: 'DNSKEY',
        257: 'CAA'
    };
    return types[typeCode] || `TYPE${typeCode}`;
}

/**
 * Initialise le formulaire de recherche DNS
 */
function initDNSLookup() {
    const dnsForm = document.getElementById('dns-lookup-form');
    if (!dnsForm) return;

    dnsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const domain = document.getElementById('dns-domain')?.value || '';
        const type = document.getElementById('dns-type')?.value || 'A';
        lookupDNS(domain, type);
    });

    // Boutons rapides pour chaque type DNS
    const dnsTypeButtons = document.querySelectorAll('[data-dns-type]');
    dnsTypeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const domain = document.getElementById('dns-domain')?.value || '';
            if (domain) {
                lookupDNS(domain, btn.dataset.dnsType);
            } else {
                showError('dns-results', 'Veuillez entrer un nom de domaine.');
            }
        });
    });
}


// ============================================================
// 7. ROUTAGE BGP (RIPE Stat - 7 endpoints)
// ============================================================

/** Définition des endpoints RIPE Stat BGP */
const RIPE_ENDPOINTS = {
    'routing-status': {
        url: 'https://stat.ripe.net/data/routing-status/data.json',
        label: '🚦 Routing Status',
        description: 'Statut de routage actuel de la ressource'
    },
    'bgp-state': {
        url: 'https://stat.ripe.net/data/bgp-state/data.json',
        label: '📡 BGP State',
        description: 'État BGP actuel'
    },
    'prefix-overview': {
        url: 'https://stat.ripe.net/data/prefix-overview/data.json',
        label: '📋 Prefix Overview',
        description: 'Vue d\'ensemble du préfixe'
    },
    'announced-prefixes': {
        url: 'https://stat.ripe.net/data/announced-prefixes/data.json',
        label: '📢 Announced Prefixes',
        description: 'Préfixes annoncés'
    },
    'as-overview': {
        url: 'https://stat.ripe.net/data/as-overview/data.json',
        label: '🏢 AS Overview',
        description: 'Vue d\'ensemble de l\'AS'
    },
    'network-info': {
        url: 'https://stat.ripe.net/data/network-info/data.json',
        label: '🌐 Network Info',
        description: 'Informations réseau'
    },
    'geoloc': {
        url: 'https://stat.ripe.net/data/geoloc/data.json',
        label: '📍 Geolocation',
        description: 'Géolocalisation de la ressource'
    }
};

/**
 * Exécute une requête vers un endpoint RIPE Stat
 * @param {string} endpoint - Clé de l'endpoint (ex: 'routing-status')
 * @param {string} resource - Ressource à interroger (IP, préfixe, ASN)
 */
async function queryRIPE(endpoint, resource) {
    if (!resource || !resource.trim()) {
        showError('bgp-results', 'Veuillez entrer une ressource (IP, préfixe ou ASN).');
        return;
    }

    const endpointConfig = RIPE_ENDPOINTS[endpoint];
    if (!endpointConfig) {
        showError('bgp-results', `Endpoint inconnu: ${endpoint}`);
        return;
    }

    resource = resource.trim();
    showLoading('bgp-results');

    try {
        const response = await fetch(`${endpointConfig.url}?resource=${encodeURIComponent(resource)}`);

        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        displayBGPResults(endpoint, resource, endpointConfig, data);

    } catch (error) {
        showError('bgp-results', `Erreur RIPE ${endpointConfig.label}: ${error.message}`);
    }
}

/**
 * Affiche les résultats BGP en JSON formaté
 */
function displayBGPResults(endpoint, resource, config, data) {
    const container = document.getElementById('bgp-results');
    if (!container) return;

    const statusClass = data.status === 'ok' ? 'success' : 'error';
    const resultData = data.data || {};

    let html = `
        <div class="bgp-result">
            <div class="bgp-result-header">
                <h4>${config.label} - ${sanitizeHTML(resource)}</h4>
                <span class="bgp-status ${statusClass}">${data.status || 'unknown'}</span>
            </div>
            <p class="bgp-description">${config.description}</p>
    `;

    // Affichage spécifique par endpoint
    switch (endpoint) {
        case 'routing-status':
            html += formatRoutingStatus(resultData);
            break;
        case 'as-overview':
            html += formatASOverview(resultData);
            break;
        case 'prefix-overview':
            html += formatPrefixOverview(resultData);
            break;
        case 'network-info':
            html += formatNetworkInfo(resultData);
            break;
        default:
            // Pour les autres endpoints, afficher le JSON formaté
            break;
    }

    // JSON complet dans un détails repliable
    html += `
            <details class="bgp-json-details">
                <summary>📄 Voir le JSON complet</summary>
                <div class="json-container">
                    <button class="copy-btn" onclick="copyToClipboard(JSON.stringify(${sanitizeHTML(JSON.stringify(resultData))}, null, 2))">📋 Copier</button>
                    <pre class="json-output">${formatJSON(resultData)}</pre>
                </div>
            </details>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Formate les données Routing Status
 */
function formatRoutingStatus(data) {
    if (!data) return '';
    let html = '<div class="bgp-summary-grid">';

    if (data.visibility !== undefined) {
        html += `<div class="bgp-stat"><span class="stat-label">Visibilité</span><span class="stat-value">${data.visibility || 'N/A'}%</span></div>`;
    }
    if (data.announced !== undefined) {
        html += `<div class="bgp-stat"><span class="stat-label">Annoncé</span><span class="stat-value">${data.announced ? '✅ Oui' : '❌ Non'}</span></div>`;
    }
    if (data.first_seen) {
        html += `<div class="bgp-stat"><span class="stat-label">Premier vu</span><span class="stat-value">${sanitizeHTML(data.first_seen.prefix || data.first_seen)}</span></div>`;
    }
    if (data.last_seen) {
        html += `<div class="bgp-stat"><span class="stat-label">Dernier vu</span><span class="stat-value">${sanitizeHTML(data.last_seen.prefix || data.last_seen)}</span></div>`;
    }

    html += '</div>';
    return html;
}

/**
 * Formate les données AS Overview
 */
function formatASOverview(data) {
    if (!data) return '';
    let html = '<div class="bgp-summary-grid">';

    if (data.holder) {
        html += `<div class="bgp-stat"><span class="stat-label">Titulaire</span><span class="stat-value">${sanitizeHTML(data.holder)}</span></div>`;
    }
    if (data.resource) {
        html += `<div class="bgp-stat"><span class="stat-label">Ressource</span><span class="stat-value">${sanitizeHTML(data.resource)}</span></div>`;
    }
    if (data.block) {
        html += `<div class="bgp-stat"><span class="stat-label">Bloc</span><span class="stat-value">${sanitizeHTML(data.block?.name || JSON.stringify(data.block))}</span></div>`;
    }
    if (data.announced !== undefined) {
        html += `<div class="bgp-stat"><span class="stat-label">Annoncé</span><span class="stat-value">${data.announced ? '✅ Oui' : '❌ Non'}</span></div>`;
    }

    html += '</div>';
    return html;
}

/**
 * Formate les données Prefix Overview
 */
function formatPrefixOverview(data) {
    if (!data) return '';
    let html = '<div class="bgp-summary-grid">';

    if (data.resource) {
        html += `<div class="bgp-stat"><span class="stat-label">Préfixe</span><span class="stat-value">${sanitizeHTML(data.resource)}</span></div>`;
    }
    if (data.is_less_specific !== undefined) {
        html += `<div class="bgp-stat"><span class="stat-label">Less Specific</span><span class="stat-value">${data.is_less_specific ? '✅' : '❌'}</span></div>`;
    }
    if (data.asns) {
        const asns = data.asns.map(a => `AS${a.asn} (${sanitizeHTML(a.holder || 'N/A')})`).join(', ');
        html += `<div class="bgp-stat wide"><span class="stat-label">ASNs</span><span class="stat-value">${asns}</span></div>`;
    }

    html += '</div>';
    return html;
}

/**
 * Formate les données Network Info
 */
function formatNetworkInfo(data) {
    if (!data) return '';
    let html = '<div class="bgp-summary-grid">';

    if (data.prefix) {
        html += `<div class="bgp-stat"><span class="stat-label">Préfixe</span><span class="stat-value">${sanitizeHTML(data.prefix)}</span></div>`;
    }
    if (data.asns) {
        html += `<div class="bgp-stat"><span class="stat-label">ASNs</span><span class="stat-value">${data.asns.join(', ')}</span></div>`;
    }

    html += '</div>';
    return html;
}

/**
 * Initialise le formulaire BGP
 */
function initBGPLookup() {
    const bgpForm = document.getElementById('bgp-lookup-form');
    if (!bgpForm) return;

    bgpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const resource = document.getElementById('bgp-resource')?.value || '';
        const endpoint = document.getElementById('bgp-endpoint')?.value || 'routing-status';
        queryRIPE(endpoint, resource);
    });

    // Boutons pour chaque endpoint RIPE
    const ripeButtons = document.querySelectorAll('[data-ripe-endpoint]');
    ripeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const resource = document.getElementById('bgp-resource')?.value || '';
            if (resource) {
                queryRIPE(btn.dataset.ripeEndpoint, resource);
            } else {
                showError('bgp-results', 'Veuillez entrer une ressource.');
            }
        });
    });
}


// ============================================================
// 8. RENDU DES COURS (depuis coursesData)
// ============================================================

/** État de pagination des cours */
let coursePage = 1;
const coursesPerPage = 12;
let currentCourseFilter = 'all';
let currentCourseSearch = '';

/**
 * Génère et affiche les cartes de cours
 * @param {string} filter - Filtre par catégorie ('all' pour tout)
 * @param {string} search - Terme de recherche textuelle
 */
function renderCourses(filter, search) {
    const container = document.getElementById('courses-container');
    const detailContainer = document.getElementById('course-detail');

    if (!container) return;

    // Mettre à jour les filtres
    if (filter !== undefined) currentCourseFilter = filter;
    if (search !== undefined) currentCourseSearch = search.toLowerCase();

    // Vérifier que coursesData existe
    if (typeof coursesData === 'undefined' || !Array.isArray(coursesData)) {
        container.innerHTML = '<p class="info-error">Données de cours non disponibles. Vérifiez que data.js est chargé.</p>';
        return;
    }

    // Filtrer les cours
    let filtered = coursesData.filter(course => {
        const matchFilter = currentCourseFilter === 'all' || course.category === currentCourseFilter;
        const matchSearch = !currentCourseSearch ||
            (course.title || '').toLowerCase().includes(currentCourseSearch) ||
            (course.description || '').toLowerCase().includes(currentCourseSearch) ||
            (course.tags || []).some(tag => tag.toLowerCase().includes(currentCourseSearch));
        return matchFilter && matchSearch;
    });

    // Extraire les catégories uniques pour le filtre
    const categories = [...new Set(coursesData.map(c => c.category).filter(Boolean))];

    // Pagination
    const totalPages = Math.ceil(filtered.length / coursesPerPage);
    const startIndex = (coursePage - 1) * coursesPerPage;
    const paginatedCourses = filtered.slice(startIndex, startIndex + coursesPerPage);

    // Construire le HTML des filtres
    let html = `
        <div class="courses-toolbar">
            <div class="courses-filters">
                <button class="filter-btn ${currentCourseFilter === 'all' ? 'active' : ''}" onclick="renderCourses('all')">Tous</button>
                ${categories.map(cat => `
                    <button class="filter-btn ${currentCourseFilter === cat ? 'active' : ''}" onclick="renderCourses('${sanitizeHTML(cat)}')">${sanitizeHTML(cat)}</button>
                `).join('')}
            </div>
            <div class="courses-search">
                <input type="text" id="course-search-input" placeholder="🔍 Rechercher un cours..." value="${sanitizeHTML(currentCourseSearch)}" onkeyup="handleCourseSearch(this.value)">
            </div>
            <p class="courses-count">${filtered.length} cours trouvé${filtered.length > 1 ? 's' : ''}</p>
        </div>
    `;

    // Construire les cartes de cours
    if (paginatedCourses.length > 0) {
        html += '<div class="courses-grid">';
        paginatedCourses.forEach((course, index) => {
            const globalIndex = startIndex + index;
            html += `
                <div class="course-card" onclick="showCourseDetail(${globalIndex})" tabindex="0" role="button" aria-label="Voir le cours: ${sanitizeHTML(course.title || '')}">
                    <div class="course-card-header">
                        <span class="course-icon">${course.icon || '📚'}</span>
                        <span class="course-category">${sanitizeHTML(course.category || '')}</span>
                    </div>
                    <h3 class="course-title">${sanitizeHTML(course.title || 'Sans titre')}</h3>
                    <p class="course-description">${sanitizeHTML((course.description || '').substring(0, 120))}${(course.description || '').length > 120 ? '...' : ''}</p>
                    <div class="course-meta">
                        ${course.duration ? `<span class="course-duration">⏱️ ${sanitizeHTML(course.duration)}</span>` : ''}
                        ${course.level ? `<span class="course-level">📊 ${sanitizeHTML(course.level)}</span>` : ''}
                    </div>
                    ${(course.tags || []).length > 0 ? `
                        <div class="course-tags">
                            ${course.tags.slice(0, 3).map(tag => `<span class="tag">${sanitizeHTML(tag)}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        html += '</div>';

        // Pagination
        if (totalPages > 1) {
            html += '<div class="pagination">';
            html += `<button class="page-btn" ${coursePage <= 1 ? 'disabled' : ''} onclick="changePage(${coursePage - 1})">◀ Précédent</button>`;
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= coursePage - 2 && i <= coursePage + 2)) {
                    html += `<button class="page-btn ${i === coursePage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
                } else if (i === coursePage - 3 || i === coursePage + 3) {
                    html += `<span class="page-ellipsis">...</span>`;
                }
            }
            html += `<button class="page-btn" ${coursePage >= totalPages ? 'disabled' : ''} onclick="changePage(${coursePage + 1})">Suivant ▶</button>`;
            html += '</div>';
        }
    } else {
        html += '<p class="info-error">Aucun cours trouvé pour ces critères.</p>';
    }

    container.innerHTML = html;

    // Masquer le détail si visible
    if (detailContainer) {
        detailContainer.style.display = 'none';
    }
}

/**
 * Change la page des cours
 * @param {number} page - Numéro de la page
 */
function changePage(page) {
    coursePage = page;
    renderCourses();
    // Scroll vers le haut du container
    const container = document.getElementById('courses-container');
    if (container) container.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Gère la recherche de cours avec debounce
 */
let courseSearchTimeout = null;
function handleCourseSearch(value) {
    clearTimeout(courseSearchTimeout);
    courseSearchTimeout = setTimeout(() => {
        coursePage = 1;
        renderCourses(undefined, value);
    }, 300);
}

/**
 * Affiche le contenu détaillé d'un cours
 * @param {number} index - Index du cours dans coursesData
 */
function showCourseDetail(index) {
    if (typeof coursesData === 'undefined' || !coursesData[index]) return;

    const course = coursesData[index];
    const container = document.getElementById('course-detail');
    const coursesContainer = document.getElementById('courses-container');

    if (!container) return;

    let html = `
        <div class="course-detail-view">
            <button class="back-btn" onclick="closeCourseDetail()">← Retour aux cours</button>
            <div class="course-detail-header">
                <span class="course-detail-icon">${course.icon || '📚'}</span>
                <div>
                    <h2>${sanitizeHTML(course.title || 'Sans titre')}</h2>
                    <span class="course-category">${sanitizeHTML(course.category || '')}</span>
                    ${course.level ? `<span class="course-level">${sanitizeHTML(course.level)}</span>` : ''}
                    ${course.duration ? `<span class="course-duration">⏱️ ${sanitizeHTML(course.duration)}</span>` : ''}
                </div>
            </div>
            <div class="course-detail-content">
                ${course.content || course.description || '<p>Contenu non disponible.</p>'}
            </div>
            ${(course.tags || []).length > 0 ? `
                <div class="course-tags">
                    ${course.tags.map(tag => `<span class="tag">${sanitizeHTML(tag)}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `;

    container.innerHTML = html;
    container.style.display = 'block';

    if (coursesContainer) {
        coursesContainer.style.display = 'none';
    }

    container.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Ferme la vue détail et revient à la liste des cours
 */
function closeCourseDetail() {
    const container = document.getElementById('course-detail');
    const coursesContainer = document.getElementById('courses-container');

    if (container) container.style.display = 'none';
    if (coursesContainer) coursesContainer.style.display = 'block';
}


// ============================================================
// 9. RENDU DES APPAREILS (depuis devicesData)
// ============================================================

/**
 * Génère et affiche les cartes d'appareils réseau
 */
function renderDevices() {
    const container = document.getElementById('devices-container');
    if (!container) return;

    if (typeof devicesData === 'undefined' || !Array.isArray(devicesData)) {
        container.innerHTML = '<p class="info-error">Données d\'appareils non disponibles. Vérifiez que data.js est chargé.</p>';
        return;
    }

    // Icônes par défaut par type d'appareil
    const deviceIcons = {
        'router': '🔀',
        'switch': '🔌',
        'firewall': '🛡️',
        'server': '🖥️',
        'access-point': '📶',
        'modem': '📡',
        'hub': '🔗',
        'bridge': '🌉',
        'gateway': '🚪',
        'load-balancer': '⚖️',
        'nas': '💾',
        'printer': '🖨️',
        'camera': '📹',
        'phone': '📞',
        'default': '📦'
    };

    let html = '<div class="devices-grid">';

    devicesData.forEach(device => {
        const icon = device.icon || deviceIcons[device.type?.toLowerCase()] || deviceIcons.default;
        const statusClass = device.status === 'active' ? 'status-active' :
                          device.status === 'inactive' ? 'status-inactive' : 'status-unknown';

        html += `
            <div class="device-card">
                <div class="device-icon-wrapper">
                    <span class="device-icon">${icon}</span>
                    <span class="device-status ${statusClass}"></span>
                </div>
                <h3 class="device-name">${sanitizeHTML(device.name || 'Appareil inconnu')}</h3>
                <p class="device-type">${sanitizeHTML(device.type || 'N/A')}</p>
                ${device.ip ? `<p class="device-ip">IP: ${sanitizeHTML(device.ip)}</p>` : ''}
                ${device.mac ? `<p class="device-mac">MAC: ${sanitizeHTML(device.mac)}</p>` : ''}
                ${device.description ? `<p class="device-description">${sanitizeHTML(device.description)}</p>` : ''}
                ${device.ports ? `<p class="device-ports">Ports: ${sanitizeHTML(String(device.ports))}</p>` : ''}
                ${device.vendor ? `<p class="device-vendor">Fabricant: ${sanitizeHTML(device.vendor)}</p>` : ''}
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}


// ============================================================
// 10. RENDU CONTENU STATIQUE (depuis data.js)
// ============================================================

/**
 * Injecte le contenu entreprise depuis enterpriseData
 */
function renderEnterprise() {
    const container = document.getElementById('enterprise-container');
    if (!container) return;

    if (typeof enterpriseData === 'undefined') {
        container.innerHTML = '<p class="info-error">Données entreprise non disponibles.</p>';
        return;
    }

    // Si enterpriseData est un string HTML, l'injecter directement
    if (typeof enterpriseData === 'string') {
        container.innerHTML = enterpriseData;
    } else if (typeof enterpriseData === 'object') {
        // Si c'est un objet structuré, construire le HTML
        let html = '';

        if (enterpriseData.title) {
            html += `<h2 class="section-title">${sanitizeHTML(enterpriseData.title)}</h2>`;
        }
        if (enterpriseData.description) {
            html += `<p class="section-description">${enterpriseData.description}</p>`;
        }
        if (enterpriseData.content) {
            html += enterpriseData.content;
        }
        if (enterpriseData.sections && Array.isArray(enterpriseData.sections)) {
            enterpriseData.sections.forEach(section => {
                html += `
                    <div class="content-section">
                        <h3>${sanitizeHTML(section.title || '')}</h3>
                        <div class="section-body">${section.content || ''}</div>
                    </div>
                `;
            });
        }

        container.innerHTML = html || '<p class="info-error">Contenu entreprise vide.</p>';
    }
}

/**
 * Injecte le contenu sécurité depuis securityData
 */
function renderSecurity() {
    const container = document.getElementById('security-container');
    if (!container) return;

    if (typeof securityData === 'undefined') {
        container.innerHTML = '<p class="info-error">Données sécurité non disponibles.</p>';
        return;
    }

    if (typeof securityData === 'string') {
        container.innerHTML = securityData;
    } else if (typeof securityData === 'object') {
        let html = '';

        if (securityData.title) {
            html += `<h2 class="section-title">${sanitizeHTML(securityData.title)}</h2>`;
        }
        if (securityData.description) {
            html += `<p class="section-description">${securityData.description}</p>`;
        }
        if (securityData.content) {
            html += securityData.content;
        }
        if (securityData.sections && Array.isArray(securityData.sections)) {
            securityData.sections.forEach(section => {
                html += `
                    <div class="content-section">
                        <h3>${sanitizeHTML(section.title || '')}</h3>
                        <div class="section-body">${section.content || ''}</div>
                    </div>
                `;
            });
        }

        container.innerHTML = html || '<p class="info-error">Contenu sécurité vide.</p>';
    }
}

/**
 * Injecte le contenu Windows depuis windowsData
 */
function renderWindows() {
    const container = document.getElementById('windows-container');
    if (!container) return;

    if (typeof windowsData === 'undefined') {
        container.innerHTML = '<p class="info-error">Données Windows non disponibles.</p>';
        return;
    }

    if (typeof windowsData === 'string') {
        container.innerHTML = windowsData;
    } else if (typeof windowsData === 'object') {
        let html = '';

        if (windowsData.title) {
            html += `<h2 class="section-title">${sanitizeHTML(windowsData.title)}</h2>`;
        }
        if (windowsData.description) {
            html += `<p class="section-description">${windowsData.description}</p>`;
        }
        if (windowsData.content) {
            html += windowsData.content;
        }
        if (windowsData.sections && Array.isArray(windowsData.sections)) {
            windowsData.sections.forEach(section => {
                html += `
                    <div class="content-section">
                        <h3>${sanitizeHTML(section.title || '')}</h3>
                        <div class="section-body">${section.content || ''}</div>
                    </div>
                `;
            });
        }

        container.innerHTML = html || '<p class="info-error">Contenu Windows vide.</p>';
    }
}


// ============================================================
// 11. OSI MODEL INTERACTIF
// ============================================================

/**
 * Crée la visualisation interactive des 7 couches OSI
 */
function renderOSI() {
    const container = document.getElementById('osi-container');
    if (!container) return;

    // Données par défaut si osiData n'est pas défini
    const layers = (typeof osiData !== 'undefined' && Array.isArray(osiData)) ? osiData : [
        {
            number: 7, name: 'Application',
            color: '#e74c3c',
            protocols: ['HTTP', 'HTTPS', 'FTP', 'SMTP', 'DNS', 'DHCP', 'SSH', 'Telnet', 'SNMP'],
            pdu: 'Données',
            description: 'Interface entre l\'utilisateur et le réseau. Fournit des services réseau aux applications.',
            details: 'Cette couche gère les protocoles de haut niveau, les questions de représentation, et le dialogue utilisateur. Elle est la plus proche de l\'utilisateur final et interagit avec les applications logicielles.'
        },
        {
            number: 6, name: 'Présentation',
            color: '#e67e22',
            protocols: ['SSL/TLS', 'JPEG', 'GIF', 'MPEG', 'ASCII', 'EBCDIC'],
            pdu: 'Données',
            description: 'Traduction, chiffrement et compression des données.',
            details: 'Cette couche traduit les données entre le format réseau et le format attendu par l\'application. Elle gère le chiffrement/déchiffrement et la compression des données.'
        },
        {
            number: 5, name: 'Session',
            color: '#f1c40f',
            protocols: ['NetBIOS', 'RPC', 'PPTP', 'SAP', 'SDP'],
            pdu: 'Données',
            description: 'Gestion des sessions de communication entre les hôtes.',
            details: 'Établit, gère et termine les connexions entre applications. Fournit le contrôle de dialogue (simplex, half-duplex, full-duplex) et la synchronisation.'
        },
        {
            number: 4, name: 'Transport',
            color: '#2ecc71',
            protocols: ['TCP', 'UDP', 'SCTP', 'DCCP'],
            pdu: 'Segment / Datagramme',
            description: 'Transport fiable (TCP) ou non-fiable (UDP) des données de bout en bout.',
            details: 'Responsable du transport fiable des données entre les hôtes. Gère la segmentation, le contrôle de flux, la correction d\'erreurs et le multiplexage.'
        },
        {
            number: 3, name: 'Réseau',
            color: '#3498db',
            protocols: ['IP', 'ICMP', 'IGMP', 'IPsec', 'OSPF', 'RIP', 'BGP'],
            pdu: 'Paquet',
            description: 'Adressage logique et routage des paquets à travers les réseaux.',
            details: 'Détermine le meilleur chemin physique pour que les données atteignent leur destination. Gère l\'adressage logique (IP), le routage et la fragmentation des paquets.'
        },
        {
            number: 2, name: 'Liaison de données',
            color: '#9b59b6',
            protocols: ['Ethernet', 'Wi-Fi (802.11)', 'PPP', 'HDLC', 'ARP', 'STP'],
            pdu: 'Trame',
            description: 'Transfert fiable de données entre nœuds adjacents. Adressage physique (MAC).',
            details: 'Divisée en deux sous-couches: LLC (Logical Link Control) et MAC (Media Access Control). Gère l\'adressage physique, l\'accès au média, la détection d\'erreurs et le contrôle de flux.'
        },
        {
            number: 1, name: 'Physique',
            color: '#1abc9c',
            protocols: ['Ethernet (câble)', 'USB', 'Bluetooth', 'DSL', 'Fibre optique', 'Wi-Fi (radio)'],
            pdu: 'Bits',
            description: 'Transmission des bits bruts sur le support physique.',
            details: 'Définit les caractéristiques électriques, mécaniques et fonctionnelles pour activer, maintenir et désactiver les connexions physiques. Gère les signaux électriques, optiques ou radio.'
        }
    ];

    let html = `
        <div class="osi-model">
            <h2 class="section-title">🏗️ Modèle OSI - 7 Couches</h2>
            <p class="section-description">Cliquez sur une couche pour voir les détails</p>
            <div class="osi-stack">
    `;

    layers.forEach(layer => {
        html += `
            <div class="osi-layer" data-layer="${layer.number}" style="--layer-color: ${layer.color}" onclick="toggleOSILayer(this)">
                <div class="osi-layer-header">
                    <span class="osi-layer-number">${layer.number}</span>
                    <span class="osi-layer-name">${sanitizeHTML(layer.name)}</span>
                    <span class="osi-layer-pdu">${sanitizeHTML(layer.pdu || '')}</span>
                    <span class="osi-layer-toggle">▼</span>
                </div>
                <p class="osi-layer-desc">${sanitizeHTML(layer.description || '')}</p>
                <div class="osi-layer-details" style="display: none;">
                    <div class="osi-detail-content">
                        <p>${sanitizeHTML(layer.details || '')}</p>
                        <div class="osi-protocols">
                            <strong>Protocoles:</strong>
                            <div class="osi-protocol-list">
                                ${(layer.protocols || []).map(p => `<span class="osi-protocol-badge" style="background: ${layer.color}22; color: ${layer.color}; border: 1px solid ${layer.color}44">${sanitizeHTML(p)}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Toggle l'affichage des détails d'une couche OSI
 * @param {HTMLElement} element - L'élément couche cliqué
 */
function toggleOSILayer(element) {
    const details = element.querySelector('.osi-layer-details');
    const toggle = element.querySelector('.osi-layer-toggle');

    if (!details) return;

    const isOpen = details.style.display !== 'none';

    // Fermer toutes les autres couches
    document.querySelectorAll('.osi-layer-details').forEach(d => {
        d.style.display = 'none';
    });
    document.querySelectorAll('.osi-layer-toggle').forEach(t => {
        t.textContent = '▼';
    });
    document.querySelectorAll('.osi-layer').forEach(l => {
        l.classList.remove('expanded');
    });

    if (!isOpen) {
        details.style.display = 'block';
        toggle.textContent = '▲';
        element.classList.add('expanded');
    }
}


// ============================================================
// 12. UTILITAIRES
// ============================================================

/**
 * Affiche un indicateur de chargement dans un élément
 * @param {string} elementId - ID de l'élément conteneur
 */
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p class="loading-text">Chargement en cours...</p>
        </div>
    `;
}

/**
 * Met à jour le message de chargement
 * @param {string} elementId - ID de l'élément conteneur
 * @param {string} message - Nouveau message
 */
function updateLoadingMessage(elementId, message) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const loadingText = element.querySelector('.loading-text');
    if (loadingText) {
        loadingText.textContent = message;
    }
}

/**
 * Masque l'indicateur de chargement
 * @param {string} elementId - ID de l'élément conteneur
 */
function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const loader = element.querySelector('.loading-container');
    if (loader) {
        loader.remove();
    }
}

/**
 * Affiche un message d'erreur dans un élément
 * @param {string} elementId - ID de l'élément conteneur
 * @param {string} message - Message d'erreur
 */
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.innerHTML = `
        <div class="error-container">
            <span class="error-icon">⚠️</span>
            <p class="error-message">${sanitizeHTML(message)}</p>
            <button class="error-retry-btn" onclick="this.parentElement.remove()">Fermer</button>
        </div>
    `;
}

/**
 * Formate un objet JSON avec coloration syntaxique HTML
 * @param {*} obj - Objet à formater
 * @returns {string} HTML avec coloration syntaxique
 */
function formatJSON(obj) {
    if (obj === null || obj === undefined) return '<span class="json-null">null</span>';

    const jsonString = JSON.stringify(obj, null, 2);

    // Coloration syntaxique
    return jsonString
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, (match) => {
            let cls = 'json-string';
            if (match.endsWith(':')) {
                cls = 'json-key';
                // Retirer les guillemets de la clé pour un rendu plus propre
                return `<span class="${cls}">${match}</span>`;
            }
            return `<span class="${cls}">${match}</span>`;
        })
        .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
        .replace(/\b(null)\b/g, '<span class="json-null">$1</span>')
        .replace(/\b(-?\d+\.?\d*([eE][+-]?\d+)?)\b/g, '<span class="json-number">$1</span>');
}

/**
 * Copie du texte dans le presse-papiers
 * @param {string} text - Texte à copier
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback pour les navigateurs plus anciens
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }

        // Notification visuelle
        showCopyNotification();
    } catch (err) {
        console.error('Erreur lors de la copie:', err);
    }
}

/**
 * Affiche une notification temporaire après une copie
 */
function showCopyNotification() {
    // Retirer une notification existante
    const existing = document.getElementById('copy-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'copy-notification';
    notification.className = 'copy-notification';
    notification.textContent = '✅ Copié dans le presse-papiers!';
    document.body.appendChild(notification);

    // Animation d'entrée
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // Retirer après 2 secondes
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

/**
 * Sanitise une chaîne HTML pour prévenir les injections XSS
 * @param {string} str - Chaîne à sanitiser
 * @returns {string} Chaîne sanitisée
 */
function sanitizeHTML(str) {
    if (str === null || str === undefined) return '';
    if (typeof str !== 'string') str = String(str);
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

/**
 * Utilitaire pour attendre un certain temps
 * @param {number} ms - Millisecondes à attendre
 * @returns {Promise}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// ============================================================
// 13. INITIALISATION
// ============================================================

/**
 * Sidebar toggle pour mobile
 */
function initSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('active');
            document.body.classList.toggle('sidebar-open');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            closeMobileSidebar();
        });
    }
}

/**
 * Ferme la sidebar mobile
 */
function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('sidebar-open');
}

/**
 * Initialise tous les modules de l'application
 */
function initApp() {
    console.log('🚀 NetDeep - Initialisation...');

    // 1. Animation Matrix
    initMatrixAnimation();

    // 2. Navigation par onglets
    initTabNavigation();

    // 3. Sidebar mobile
    initSidebar();

    // 4. Charger le dashboard (onglet par défaut)
    loadDashboard();

    // 5. Initialiser les formulaires
    initDiagnostics();
    initIPLookup();
    initDNSLookup();
    initBGPLookup();

    // 6. Pré-rendre les contenus statiques si les tabs sont déjà visibles
    // (les autres se chargent au clic via switchTab)

    // 7. Raccourcis clavier
    initKeyboardShortcuts();

    console.log('✅ NetDeep - Initialisation terminée');
}

/**
 * Initialise les raccourcis clavier
 */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+K : Focus sur la barre de recherche active
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            const searchInputs = document.querySelectorAll('input[type="text"]:not([style*="display: none"])');
            if (searchInputs.length > 0) {
                searchInputs[0].focus();
            }
        }

        // Echap : Fermer les modales ou le détail de cours
        if (e.key === 'Escape') {
            closeCourseDetail();
            closeMobileSidebar();
        }
    });
}

// ── Point d'entrée ──
document.addEventListener('DOMContentLoaded', initApp);
