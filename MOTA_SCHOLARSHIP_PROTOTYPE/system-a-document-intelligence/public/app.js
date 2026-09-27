let currentResponseData = null;
let selectedFilesList = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkHealth();
  setupDragAndDrop();
});

// Check health
async function checkHealth() {
  const badge = document.getElementById('healthBadge');
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    if (data.status === 'UP') {
      badge.innerHTML = `<span class="status-dot"></span> OCR Engine Online (${data.ocrEngine || 'PaddleOCR + PyMuPDF'})`;
    }
  } catch (err) {
    badge.innerHTML = `<span class="status-dot" style="background:#ef4444"></span> Engine Disconnected`;
  }
}

// Drag & Drop
function setupDragAndDrop() {
  const dropZone = document.getElementById('dropZone');
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.style.borderColor = '#2563eb';
    });
  });
  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.style.borderColor = '#cbd5e1';
    });
  });
  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt.files && dt.files.length > 0) {
      document.getElementById('fileInput').files = dt.files;
      updateFileList(dt.files);
    }
  });
}

function updateFileList(files) {
  selectedFilesList = Array.from(files);
  const container = document.getElementById('selectedFiles');
  const analyzeBtn = document.getElementById('analyzeBtn');

  if (selectedFilesList.length === 0) {
    container.innerHTML = '';
    analyzeBtn.disabled = true;
    return;
  }

  container.innerHTML = `<strong>Selected ${selectedFilesList.length} file(s):</strong>` + 
    selectedFilesList.map(f => `
      <div class="file-item">
        <span>📄 ${escapeHtml(f.name)}</span>
        <span>${(f.size / 1024).toFixed(1)} KB</span>
      </div>
    `).join('');

  analyzeBtn.disabled = false;
}

// Switch tabs
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  event.currentTarget.classList.add('active');
  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
}

// Load Demo Scenario
async function loadDemoScenario(scenarioKey) {
  showLoading(true);
  try {
    const res = await fetch('/api/demo-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: scenarioKey })
    });
    const data = await res.json();
    renderAnalysisResults(data);
  } catch (err) {
    alert('Failed to load demo scenario: ' + err.message);
  } finally {
    showLoading(false);
  }
}

// Handle Upload Submit
async function handleUpload(e) {
  e.preventDefault();
  if (selectedFilesList.length === 0) return;

  const formData = new FormData();
  for (const file of selectedFilesList) {
    formData.append('documents', file);
  }

  showLoading(true);
  try {
    const res = await fetch('/api/analyze-documents', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Server error');
    }
    renderAnalysisResults(data);
  } catch (err) {
    alert('Upload & Analysis Failed: ' + err.message);
  } finally {
    showLoading(false);
  }
}

function showLoading(show) {
  document.getElementById('loadingIndicator').style.display = show ? 'block' : 'none';
  if (show) {
    document.getElementById('resultsContainer').style.display = 'none';
  }
}

// Render Results
function renderAnalysisResults(data) {
  currentResponseData = data;
  document.getElementById('resultsContainer').style.display = 'block';

  // Overview Bar
  document.getElementById('resAppId').textContent = data.applicationId || 'N/A';
  document.getElementById('resDocCount').textContent = data.documents ? data.documents.length : 0;
  
  const anomalyLevel = data.anomalies?.level || 'LOW';
  const anomalyEl = document.getElementById('resAnomalyLevel');
  anomalyEl.textContent = anomalyLevel;
  anomalyEl.className = `badge ${anomalyLevel.toLowerCase()}`;

  const summaryEl = document.getElementById('resReviewSummary');
  if (anomalyLevel === 'HIGH') {
    summaryEl.textContent = 'Potential inconsistency detected; human verification recommended.';
    summaryEl.style.color = '#b91c1c';
  } else if (anomalyLevel === 'MEDIUM') {
    summaryEl.textContent = 'Minor issues or incomplete data; manual check suggested.';
    summaryEl.style.color = '#b45309';
  } else {
    summaryEl.textContent = 'Consistent document set. Ready for System B processing.';
    summaryEl.style.color = '#15803d';
  }

  // Tab counts
  const docs = data.documents || [];
  const valResults = data.crossDocumentValidation || [];
  const flags = data.reviewFlags || [];

  document.getElementById('tabDocCount').textContent = docs.length;
  document.getElementById('tabValCount').textContent = valResults.length;
  document.getElementById('tabFlagCount').textContent = flags.length;

  // Render Documents Tab
  renderDocumentsTab(docs);

  // Render Applicant Profile Tab
  renderProfileTab(data.applicantProfile);

  // Render Cross-Doc Validation Tab
  renderValidationTab(valResults);

  // Render Anomalies Tab
  renderAnomaliesTab(data.anomalies, flags);

  // Render Raw JSON
  document.getElementById('rawJsonResponse').textContent = JSON.stringify(data, null, 2);

  // Scroll to results
  document.getElementById('resultsContainer').scrollIntoView({ behavior: 'smooth' });
}

function renderDocumentsTab(docs) {
  const container = document.getElementById('documentsList');
  container.innerHTML = docs.map(doc => {
    const qClass = (doc.quality || 'GOOD').toLowerCase();
    const fieldsEntries = Object.entries(doc.fields || {});
    const fieldConf = doc.fieldConfidence || {};
    
    return `
      <div class="doc-card">
        <div class="doc-card-header">
          <div>
            <div class="doc-card-title">📄 ${escapeHtml(doc.filename || 'Document')}</div>
            <div class="doc-card-meta">
              Detected: <strong style="color:#1e3a8a;">${escapeHtml(doc.documentType)}</strong> 
              (Confidence: ${(doc.confidence * 100).toFixed(0)}%)
            </div>
            ${doc._ocrDetails ? `
              <div style="font-size:10px; color:#64748b; margin-top:2px;">
                ⚙️ ${escapeHtml(doc._ocrDetails.engine || 'PaddleOCR')} | Lines: ${doc._ocrDetails.linesDetected || 0}
              </div>
            ` : ''}
          </div>
          <span class="badge ${qClass}">Quality: ${escapeHtml(doc.quality)} (${(doc.qualityScore * 100).toFixed(0)}%)</span>
        </div>

        ${doc.evidence && doc.evidence.length > 0 ? `
          <div style="background:#f0f9ff; border:1px solid #bae6fd; padding:6px 10px; border-radius:4px; margin-bottom:8px; font-size:11px; color:#0369a1;">
            <strong>Classification Evidence:</strong>
            <ul style="padding-left:16px; margin:2px 0 0 0;">
              ${doc.evidence.map(e => `<li>${escapeHtml(e)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${doc.issues && doc.issues.length > 0 ? `
          <div style="background:#fffbeb; padding:6px 10px; border-radius:4px; margin-bottom:8px; font-size:11px; color:#92400e;">
            <strong>Quality Issues:</strong> ${escapeHtml(doc.issues.join('; '))}
          </div>
        ` : ''}

        ${doc.missingFields && doc.missingFields.length > 0 ? `
          <div style="background:#fef2f2; padding:6px 10px; border-radius:4px; margin-bottom:8px; font-size:11px; color:#991b1b;">
            <strong>Missing Fields:</strong> ${escapeHtml(doc.missingFields.join(', '))}
          </div>
        ` : ''}

        <table class="doc-fields-table">
          <thead>
            <tr style="border-bottom:1px solid #e2e8f0; font-size:10px; color:#64748b; text-transform:uppercase;">
              <th style="text-align:left; padding:2px 4px;">Field</th>
              <th style="text-align:left; padding:2px 4px;">Extracted Value</th>
              <th style="text-align:right; padding:2px 4px;">Confidence</th>
            </tr>
          </thead>
          <tbody>
            ${fieldsEntries.length > 0 ? fieldsEntries.map(([k, v]) => {
              const confObj = fieldConf[k];
              const confPct = confObj && confObj.confidence ? `${(confObj.confidence * 100).toFixed(0)}%` : '-';
              return `
                <tr>
                  <td class="field-key">${formatFieldKey(k)}</td>
                  <td class="field-val ${v === null ? 'val-null' : ''}">${v !== null ? escapeHtml(v) : 'null'}</td>
                  <td style="text-align:right; font-size:10px; color:${v !== null ? '#15803d' : '#94a3b8'};">
                    ${v !== null ? `${confPct} (OCR)` : '0%'}
                  </td>
                </tr>
              `;
            }).join('') : '<tr><td colspan="3" class="val-null">No structured fields extracted</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }).join('');
}

function renderProfileTab(profile) {
  const container = document.getElementById('profileGrid');
  if (!profile) {
    container.innerHTML = '<p>No profile data generated.</p>';
    return;
  }

  function renderSection(title, obj) {
    return `
      <div class="profile-section">
        <h4>${title}</h4>
        <table class="doc-fields-table">
          <tbody>
            ${Object.entries(obj || {}).map(([k, v]) => `
              <tr>
                <td class="field-key">${formatFieldKey(k)}</td>
                <td class="field-val ${v === null ? 'val-null' : ''}">${v !== null ? escapeHtml(v) : 'null'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  container.innerHTML = `
    ${renderSection('Applicant Identity', profile.applicant)}
    ${renderSection('Education Details', profile.education)}
    ${renderSection('Financial Status', profile.financial)}
    ${renderSection('Bank & DBT Information', profile.bank)}
  `;
}

function renderValidationTab(validations) {
  const tbody = document.getElementById('validationTableBody');
  tbody.innerHTML = validations.map(item => {
    const statusClass = (item.status || 'MATCH').toLowerCase();
    const docValues = item.documents && item.documents.length > 0
      ? item.documents.map(d => `<strong>${escapeHtml(d.document)}:</strong> "${escapeHtml(d.value)}"`).join('<br>')
      : '<span class="val-null">No occurrences in documents</span>';

    return `
      <tr>
        <td><strong>${escapeHtml(item.label || item.field)}</strong></td>
        <td><span class="badge ${statusClass}">${escapeHtml(item.status)}</span></td>
        <td>${docValues}</td>
        <td><small style="color:${item.status === 'MISMATCH' ? '#b91c1c' : '#475569'}">${escapeHtml(item.remarks || '')}</small></td>
      </tr>
    `;
  }).join('');
}

function renderAnomaliesTab(anomalies, flags) {
  const banner = document.getElementById('anomalyLevelBanner');
  const level = (anomalies?.level || 'LOW').toLowerCase();

  banner.className = `anomaly-banner ${level}`;
  banner.innerHTML = `
    <strong>Overall Anomaly Level: ${anomalies?.level || 'LOW'}</strong> — 
    ${level === 'high' 
      ? 'Potential inconsistency detected; human verification recommended before any downstream scholarship evaluation.' 
      : level === 'medium'
      ? 'Minor inconsistencies or missing data detected; desk verification advised.'
      : 'No critical inconsistencies identified. All key fields cross-verified.'}
  `;

  // Signals
  const signalsList = document.getElementById('anomalySignalsList');
  const signals = anomalies?.signals || [];
  signalsList.innerHTML = signals.map(s => `<li>${escapeHtml(s)}</li>`).join('');

  // Flags
  const flagsList = document.getElementById('reviewFlagsList');
  if (flags.length === 0) {
    flagsList.innerHTML = '<div class="flag-card low">No active review flags. Application is ready for processing.</div>';
  } else {
    flagsList.innerHTML = flags.map(f => {
      const sev = (f.severity || 'LOW').toLowerCase();
      return `
        <div class="flag-card ${sev}">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <strong>${escapeHtml(f.field)}</strong>
            <span class="badge ${sev}">${escapeHtml(f.severity)} PRIORITY</span>
          </div>
          <div style="font-size:13px; margin-bottom:4px;">${escapeHtml(f.message)}</div>
          <div style="font-size:11px; color:#64748b;"><strong>Desk Guidance:</strong> ${escapeHtml(f.guidance)}</div>
        </div>
      `;
    }).join('');
  }
}

function copyJson() {
  if (!currentResponseData) return;
  navigator.clipboard.writeText(JSON.stringify(currentResponseData, null, 2))
    .then(() => alert('API JSON copied to clipboard!'))
    .catch(err => alert('Copy failed: ' + err.message));
}

function formatFieldKey(k) {
  return k.replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
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
