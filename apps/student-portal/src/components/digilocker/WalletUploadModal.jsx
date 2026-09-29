import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { uploadWalletDocument } from '../../api/student';

const SCHEMAS_LIST = [
  { type: 'ST_CERTIFICATE', label: 'Scheduled Tribe (ST) Certificate', category: 'Caste / Tribe' },
  { type: 'INCOME_CERTIFICATE', label: 'Family Income Certificate', category: 'Income' },
  { type: 'DOMICILE_CERTIFICATE', label: 'Domicile / Resident Certificate', category: 'Address' },
  { type: 'CLASS_X_MARKSHEET', label: 'Class X Secondary School Marksheet', category: 'Academic' },
  { type: 'CLASS_XII_MARKSHEET', label: 'Class XII Senior Secondary Marksheet', category: 'Academic' },
  { type: 'GRADUATION_MARKSHEET', label: 'Graduation / Bachelor Degree Marksheet', category: 'Academic' },
  { type: 'PG_MARKSHEET', label: 'Post-Graduation / Master Marksheet', category: 'Academic' },
  { type: 'ADMISSION_LETTER', label: 'Institutional Admission / Offer Letter', category: 'Academic' },
  { type: 'BONAFIDE_CERTIFICATE', label: 'Institutional Bonafide Certificate', category: 'Academic' },
  { type: 'DISABILITY_CERTIFICATE', label: 'Unique Disability ID (UDID) / Certificate', category: 'Identity' },
  { type: 'PVTG_CERTIFICATE', label: 'Particularly Vulnerable Tribal Group (PVTG) Certificate', category: 'Caste / Tribe' },
  { type: 'BANK_PASSBOOK', label: 'Bank Passbook / Cancelled Cheque', category: 'Income' },
];

export default function WalletUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [docType, setDocType] = useState('ST_CERTIFICATE');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    setErrorMessage('');
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB maximum limit');
      return;
    }
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      setErrorMessage('Only PDF, JPG, JPEG, and PNG files are allowed');
      return;
    }
    setSelectedFile(file);
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setErrorMessage('');

      const base64Data = await readFileAsBase64(selectedFile);

      const payload = {
        documentType: docType,
        fileName: selectedFile.name,
        mimeType: selectedFile.type || 'application/pdf',
        fileBase64: base64Data,
      };

      const res = await uploadWalletDocument(payload);

      if (res && res.success) {
        setUploadSuccess(true);
        setTimeout(() => {
          onUploadSuccess(res.document);
          onClose();
        }, 700);
      } else {
        setErrorMessage(res?.message || 'Upload failed');
        setUploading(false);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Error uploading document to DigiLocker');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl rounded-lg border border-line bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line bg-navy px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <div>
              <h3 className="font-serif text-base font-bold leading-tight">Upload Document to DigiLocker</h3>
              <p className="text-[11px] text-white/70">National Digital Document Repository • Government of India</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="rounded p-1 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {uploadSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-soft text-forest">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="font-serif text-base font-bold text-navy">
                Document Uploaded Successfully!
              </h4>
              <p className="text-xs text-muted">
                Your document is securely stored in DigiLocker and ready to share with your scholarship application.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {errorMessage && (
                <div className="flex items-center gap-2 rounded border border-alert/30 bg-alert-soft p-3 text-xs text-alert">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Select Document Type */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Document Type <span className="text-alert">*</span>
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  disabled={uploading}
                  className="w-full rounded border border-line bg-paper px-3 py-2 text-xs font-medium text-ink focus:border-navy focus:outline-none"
                >
                  {SCHEMAS_LIST.map((schema) => (
                    <option key={schema.type} value={schema.type}>
                      {schema.label} ({schema.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Document File <span className="text-alert">*</span>
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleFileDrop}
                  className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                    dragActive ? 'border-navy bg-navy-soft' : selectedFile ? 'border-forest bg-forest-soft/30' : 'border-line bg-paper'
                  }`}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-left">
                        <FileText className="h-8 w-8 text-forest shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-ink truncate max-w-xs">{selectedFile.name}</p>
                          <p className="text-[11px] text-muted">{(selectedFile.size / 1024).toFixed(0)} KB • Ready to upload</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        disabled={uploading}
                        className="rounded p-1 text-muted hover:text-alert"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-8 w-8 text-muted" />
                      <p className="mt-2 text-xs text-ink font-medium">
                        Drag & drop your document here, or{' '}
                        <label className="text-navy font-bold cursor-pointer hover:underline">
                          browse files
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
                          />
                        </label>
                      </p>
                      <p className="mt-1 text-[11px] text-muted">Maximum file size: 10 MB (PDF, JPG, PNG)</p>
                    </>
                  )}
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="rounded border border-line bg-navy/5 p-3 text-[11px] text-muted flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-navy shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-ink">Authoritative Storage: </span>
                  Files are stored securely with SHA-256 cryptographic checksums in your DigiLocker account.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={uploading}
                  className="rounded border border-line px-4 py-2 text-xs font-semibold text-ink hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedFile || uploading}
                  onClick={handleUpload}
                  className="rounded bg-navy px-5 py-2 text-xs font-semibold text-white hover:bg-navy/90 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload to DigiLocker'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
