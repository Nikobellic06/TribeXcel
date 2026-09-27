// MoTA System B Verification Engine - Test UI Controller

let currentDemos = {};

// On load, fetch available demos and load default
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/demo-application');
    const data = await res.json();
    currentDemos = data.demos || {};

    // Load Demo 1 by default
    loadDemo('DEMO_1_ELIGIBLE');
  } catch (err) {
    console.error('Failed to initialize test UI:', err);
  }
});

function loadDemo(demoKey) {
  if (currentDemos[demoKey]) {
    const payload = currentDemos[demoKey];
    document.getElementById('jsonEditor').value = JSON.stringify(payload, null, 2);
    if (payload.scheme) {
      document.getElementById('schemeSelect').value = payload.scheme;
    }
  } else {
    // Fetch directly from API
    fetch(`/api/demo-application?scenario=${demoKey}`)
      .then((r) => r.json())
      .then((payload) => {
        document.getElementById('jsonEditor').value = JSON.stringify(payload, null, 2);
        if (payload.scheme) {
          document.getElementById('schemeSelect').value = payload.scheme;
        }
      })
      .catch((err) => alert('Failed to load demo scenario: ' + err.message));
  }
}

// When scheme selector is changed manually, load default for that scheme if available
document.getElementById('schemeSelect').addEventListener('change', (e) => {
  const scheme = e.target.value;
  try {
    const current = JSON.parse(document.getElementById('jsonEditor').value);
    current.scheme = scheme;
    document.getElementById('jsonEditor').value = JSON.stringify(current, null, 2);
  } catch (_) {}
});

function formatJson() {
  const editor = document.getElementById('jsonEditor');
  try {
    const parsed = JSON.parse(editor.value);
    editor.value = JSON.stringify(parsed, null, 2);
  } catch (err) {
    alert('Invalid JSON: ' + err.message);
  }
}

function resetJson() {
  document.getElementById('jsonEditor').value = '';
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach((pane) => pane.classList.add('hidden'));

  const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find((b) =>
    b.getAttribute('onclick')?.includes(tabId)
  );
  if (activeBtn) activeBtn.classList.add('active');

  const pane = document.getElementById(tabId);
  if (pane) pane.classList.remove('hidden');
}

async function runVerification() {
  const editor = document.getElementById('jsonEditor');
  const runBtn = document.getElementById('runBtn');

  let payload;
  try {
    payload = JSON.parse(editor.value);
  } catch (err) {
    alert('Please enter valid JSON before running verification.\n\nError: ' + err.message);
    return;
  }

  // Ensure scheme from dropdown is synced if not specified in JSON
  if (!payload.scheme) {
    payload.scheme = document.getElementById('schemeSelect').value;
  }

  runBtn.disabled = true;
  runBtn.innerText = 'Evaluating deterministic rules...';

  try {
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    renderResults(result);
  } catch (err) {
    alert('Verification request failed: ' + err.message);
  } finally {
    runBtn.disabled = false;
    runBtn.innerText = '⚡ Run AI-Assisted Verification (POST /api/verify)';
  }
}

function renderResults(result) {
  document.getElementById('emptyState').classList.add('hidden');
  document.getElementById('resultsContent').classList.remove('hidden');
  document.getElementById('timestampBadge').innerText = 'Evaluated at ' + new Date().toLocaleTimeString();

  // 1. Status Banner
  const status = result.finalStatus || 'INCOMPLETE';
  const banner = document.getElementById('statusBanner');
  banner.className = `status-banner status-${status}`;
  document.getElementById('statusTag').innerText = status;

  let subtext = '';
  if (status === 'ELIGIBLE') {
    subtext = '✓ All applicable mandatory criteria verified. Ready for officer merit ranking.';
  } else if (status === 'NOT_ELIGIBLE') {
    subtext = '✗ One or more mandatory eligibility requirements fail under scheme guidelines.';
  } else if (status === 'HUMAN_REVIEW') {
    subtext = '⚠ Document inconsistency, scan uncertainty, or field discrepancy requires authorized officer review.';
  } else {
    subtext = '? Missing mandatory supporting documents or required eligibility information.';
  }
  document.getElementById('statusSubtext').innerText = subtext;

  // 2. Rules Table
  const rulesTbody = document.getElementById('rulesTableBody');
  rulesTbody.innerHTML = '';
  (result.ruleEvaluation || []).forEach((rule) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code>${escapeHtml(rule.ruleId)}</code></td>
      <td><strong>${escapeHtml(rule.criterion)}</strong></td>
      <td><span style="color:#64748b">${escapeHtml(String(rule.expected))}</span></td>
      <td>${escapeHtml(String(rule.actual))}</td>
      <td><span class="badge badge-${escapeHtml(rule.status)}">${escapeHtml(rule.status)}</span></td>
      <td>${escapeHtml(rule.reason)}</td>
    `;
    rulesTbody.appendChild(tr);
  });

  // 3. Document Verification List
  const docsList = document.getElementById('docsList');
  docsList.innerHTML = '';
  (result.documentVerification || []).forEach((doc) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-main">
        <div class="item-title">${escapeHtml(doc.document)}</div>
        <div class="item-desc">${escapeHtml(doc.reason)}</div>
      </div>
      <div>
        <span class="badge badge-${escapeHtml(doc.status)}">${escapeHtml(doc.status)}</span>
      </div>
    `;
    docsList.appendChild(card);
  });

  // 4. Deficiencies List
  const defsList = document.getElementById('deficienciesList');
  defsList.innerHTML = '';
  if (!result.deficiencies || result.deficiencies.length === 0) {
    defsList.innerHTML = '<div style="color:#059669; font-size:13px; padding:10px 0;">✓ No deficiencies identified in this application.</div>';
  } else {
    result.deficiencies.forEach((def) => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <div class="item-main">
          <div class="item-title" style="color:#991b1b;">[${escapeHtml(def.type)}] ${escapeHtml(def.field)}</div>
          <div class="item-desc">${escapeHtml(def.reason)}</div>
        </div>
        <div>
          <span class="badge" style="background:#fee2e2; color:#991b1b; border:1px solid #f87171;">DEFICIENCY</span>
        </div>
      `;
      defsList.appendChild(card);
    });
  }

  // 5. Explanation
  document.getElementById('explanationText').innerText = result.explanation || 'No explanation generated.';

  // 6. Raw JSON
  document.getElementById('rawJsonResponse').innerText = JSON.stringify(result, null, 2);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
