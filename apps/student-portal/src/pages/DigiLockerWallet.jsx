import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Upload,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  Eye,
  Trash2,
  RefreshCw,
  FolderLock,
  ArrowLeft,
  Lock,
  ExternalLink,
} from 'lucide-react';
import Emblem from '../components/layout/Emblem';
import WalletUploadModal from '../components/digilocker/WalletUploadModal';
import WalletDocumentDetailModal from '../components/digilocker/WalletDocumentDetailModal';
import { fetchWalletOverview, fetchWalletDocuments, deleteWalletDocument } from '../api/student';

const CATEGORY_TABS = [
  { id: 'ALL', label: 'All Documents' },
  { id: 'CASTE_TRIBE', label: 'Caste & Tribe' },
  { id: 'INCOME', label: 'Income Proof' },
  { id: 'ACADEMIC', label: 'Academic' },
  { id: 'ADDRESS', label: 'Address & Domicile' },
  { id: 'IDENTITY', label: 'Identity & PwD' },
];

export default function DigiLockerWallet() {
  const [overview, setOverview] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [detailModalDocId, setDetailModalDocId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadWalletData();
  }, [selectedCategory]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError('');
      const [ovData, docsData] = await Promise.all([
        fetchWalletOverview(),
        fetchWalletDocuments({ category: selectedCategory }),
      ]);
      setOverview(ovData);
      setDocuments(docsData);
    } catch (err) {
      setError(err.message || 'Failed to load DigiLocker wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId, docName) => {
    if (!window.confirm(`Are you sure you want to remove '${docName}' from your DigiLocker wallet?`)) {
      return;
    }
    try {
      await deleteWalletDocument(docId);
      setActionMessage(`Document '${docName}' removed.`);
      await loadWalletData();
    } catch (err) {
      setError(err.message || 'Failed to delete document');
    }
  };

  const filteredDocs = documents.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.documentName?.toLowerCase().includes(q) ||
      d.documentType?.toLowerCase().includes(q) ||
      d.documentNumber?.toLowerCase().includes(q) ||
      d.issuer?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f8] text-[#1c2d42]">
      {/* Tricolour Accent Stripe */}
      <div className="h-1 bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />

      {/* Official DigiLocker Navigation Bar */}
      <header className="bg-[#0b2545] text-white border-b border-[#133e70] shadow-sm sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Authority */}
          <div className="flex items-center gap-3">
            <Link to="/digilocker-wallet" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-[#00b4d8] border border-white/10">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-[18px] font-bold tracking-tight text-white">DigiLocker</span>
                  <span className="rounded bg-[#00b4d8]/20 px-1.5 py-0.2 text-[10px] font-semibold text-[#00b4d8] border border-[#00b4d8]/30">
                    GOV.IN
                  </span>
                </div>
                <p className="text-[10.5px] text-white/70 leading-none">
                  National Digital Document Repository • Digital India
                </p>
              </div>
            </Link>
          </div>

          {/* Right Action: Link to return to TribeXcel */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/80 border-r border-white/20 pr-3">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" />
              <span>Aadhaar Verified</span>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors border border-white/15"
              title="Return to Scholarship Portal"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to TribeXcel</span>
            </Link>
          </div>
        </div>

        {/* Secondary Sub-Navigation */}
        <div className="bg-[#081c34] border-t border-white/10 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl flex items-center gap-6 text-xs font-medium text-white/70 overflow-x-auto py-2">
            <span className="text-white font-semibold border-b-2 border-[#00b4d8] pb-1 cursor-pointer">
              Issued Documents ({overview?.stats?.totalDocuments ?? documents.length})
            </span>
            <span className="hover:text-white cursor-pointer transition-colors">
              Uploaded Documents
            </span>
            <span className="hover:text-white cursor-pointer transition-colors">
              Drive Storage (1 GB)
            </span>
            <span className="hover:text-white cursor-pointer transition-colors">
              Activities & Consent Log
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Product Identity Header */}
        <div className="rounded-lg border border-line bg-gradient-to-r from-navy via-[#1e3a5f] to-navy p-6 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-accent" />
                <h1 className="font-serif text-2xl font-bold tracking-tight">DigiLocker</h1>
                <span className="rounded bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-accent border border-accent/40">
                  DIGITAL DOCUMENT WALLET
                </span>
              </div>
              <p className="text-xs font-medium text-white/80">
                National Digital Document Wallet • Government of India
              </p>
              <p className="max-w-3xl text-xs text-white/70 leading-relaxed pt-1">
                Store, manage, and retrieve your official statutory certificates, marksheets, and identity documents in your secure personal DigiLocker. Securely link and verify your documents with TribeXcel scholarship applications.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setUploadModalOpen(true)}
                className="rounded bg-accent px-4 py-2.5 text-xs font-bold text-navy hover:bg-accent/90 transition-colors shadow flex items-center gap-1.5"
              >
                <Upload className="h-4 w-4" />
                + Upload Document
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/15 pt-4">
            <div>
              <span className="block text-[11px] text-white/70">Total Documents</span>
              <span className="text-xl font-bold font-serif">{overview?.stats?.totalDocuments ?? 0}</span>
            </div>
            <div>
              <span className="block text-[11px] text-white/70">Ready to Share</span>
              <span className="text-xl font-bold font-serif text-[#a3e635]">{overview?.stats?.readyToShare ?? 0}</span>
            </div>
            <div>
              <span className="block text-[11px] text-white/70">Recently Updated</span>
              <span className="text-xl font-bold font-serif">{overview?.stats?.recentlyUpdated ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Feedback Banners */}
        {actionMessage && (
          <div className="flex items-center gap-2 rounded border border-forest/30 bg-forest-soft p-3 text-xs text-forest font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 rounded border border-alert/30 bg-alert-soft p-3 text-xs text-alert font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border border-line bg-white p-3 shadow-sm">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedCategory === tab.id
                    ? 'bg-navy text-white'
                    : 'bg-paper text-muted hover:text-ink hover:bg-paper/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box and Upload Button */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="relative min-w-[220px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted" />
              <input
                type="text"
                placeholder="Search documents or references..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded border border-line bg-paper pl-8 pr-3 py-1.5 text-xs text-ink focus:border-navy focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="rounded bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy/90 flex items-center gap-1.5 shrink-0 shadow-sm transition-colors cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              + Upload Document
            </button>
          </div>
        </div>

        {/* Documents Grid / Content */}
        {loading ? (
          <div className="py-16 text-center text-xs text-muted flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-navy" />
            Loading Documents...
          </div>
        ) : filteredDocs.length === 0 ? (
          /* Empty State */
          <div className="rounded-lg border border-dashed border-line bg-white p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy-soft">
              <FolderLock className="h-7 w-7 text-navy" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-base font-bold text-navy">
                No documents found in your DigiLocker
              </h3>
              <p className="mx-auto max-w-md text-xs text-muted">
                Your DigiLocker currently has no documents in this category. Upload your official certificates and marksheets to store them securely in your DigiLocker.
              </p>
            </div>
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setUploadModalOpen(true)}
                className="rounded bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy/90 flex items-center gap-1.5"
              >
                <Upload className="h-4 w-4" />
                Upload Your First Document
              </button>
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocs.map((doc) => {
              const summary = doc.extractedSummary || {};
              const previewFields = Object.keys(summary).slice(0, 3);

              return (
                <div
                  key={doc._id}
                  className="flex flex-col justify-between rounded-lg border border-line bg-white p-4 shadow-sm hover:border-navy/40 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Top Row: Type and Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded bg-navy-soft text-navy">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-navy leading-tight line-clamp-1">
                            {doc.documentName}
                          </h4>
                          <span className="text-[10px] text-muted capitalize">
                            {doc.category?.toLowerCase()?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          doc.status === 'READY_TO_SHARE'
                            ? 'bg-forest-soft text-forest'
                            : doc.status === 'SHARED'
                            ? 'bg-purple-100 text-purple-700'
                            : doc.status === 'REVIEW_REQUIRED'
                            ? 'bg-alert-soft text-alert'
                            : 'bg-navy-soft text-navy'
                        }`}
                      >
                        {doc.status === 'READY_TO_SHARE' && '✓ Ready to Share'}
                        {doc.status === 'SHARED' && '✓ Shared with TribeXcel'}
                        {doc.status === 'USER_VERIFIED' && '✓ User Verified'}
                        {doc.status === 'REVIEW_REQUIRED' && '⚠ Review Required'}
                        {doc.status === 'OCR_COMPLETED' && '✓ OCR Completed'}
                      </span>
                    </div>

                    {/* Metadata Details */}
                    <div className="rounded bg-paper p-2.5 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted">Issuer:</span>
                        <span className="font-semibold text-ink truncate max-w-[170px]">{doc.issuer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Reference No:</span>
                        <span className="font-mono text-ink font-semibold">{doc.documentNumber || 'Auto-detected'}</span>
                      </div>
                      {doc.issuedDate && (
                        <div className="flex justify-between">
                          <span className="text-muted">Issued Date:</span>
                          <span className="text-ink">{new Date(doc.issuedDate).toLocaleDateString('en-IN')}</span>
                        </div>
                      )}
                    </div>

                    {/* Extracted Highlights */}
                    {previewFields.length > 0 && (
                      <div className="space-y-1">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                          Extracted Entities
                        </span>
                        <div className="space-y-0.5">
                          {previewFields.map((k) => (
                            <div key={k} className="flex justify-between text-[11px]">
                              <span className="text-muted capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="font-semibold text-navy truncate max-w-[140px]">
                                {String(summary[k]?.value || '—')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                    <button
                      type="button"
                      onClick={() => setDetailModalDocId(doc._id)}
                      className="rounded bg-navy/5 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View & Correct Fields
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(doc._id, doc.documentName)}
                      className="rounded p-1.5 text-muted hover:bg-alert-soft hover:text-alert transition-colors"
                      title="Delete from wallet"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Upload Another Document Card */}
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-navy/30 bg-white/60 p-6 text-center hover:border-navy hover:bg-navy-soft/30 transition-all min-h-[200px] group cursor-pointer"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-soft group-hover:bg-navy group-hover:text-white transition-colors text-navy mb-2.5">
                <Upload className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-bold text-navy mb-0.5">+ Upload Another Document</h4>
              <p className="text-[11px] text-muted max-w-[190px]">Add certificates, marksheets, or proofs</p>
            </button>
          </div>
        )}
      </main>

      {/* Official DigiLocker Footer */}
      <footer className="mt-auto border-t border-[#d8e2ec] bg-white py-6 text-center text-xs text-muted">
        <div className="mx-auto max-w-7xl px-4 space-y-1">
          <p className="font-semibold text-ink">
            DigiLocker is a flagship initiative of Ministry of Electronics & IT (MeitY), Government of India under Digital India programme.
          </p>
          <p className="text-[11px] text-muted">
            National e-Governance Division (NeGD) • Secure 256-Bit SSL Digital Document Infrastructure
          </p>
        </div>
      </footer>

      {/* Upload Modal */}
      <WalletUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={(newDoc) => {
          loadWalletData();
          if (newDoc?._id) {
            setDetailModalDocId(newDoc._id);
          }
        }}
      />

      {/* Document Detail & Field Editor Modal */}
      <WalletDocumentDetailModal
        isOpen={!!detailModalDocId}
        documentId={detailModalDocId}
        onClose={() => setDetailModalDocId(null)}
        onDocumentUpdated={loadWalletData}
      />
    </div>
  );
}
