'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, getDocuments, uploadDocument, deleteRagDocument } from '@/lib/api';
import { AlertTriangle, CheckCircle, FileText, FileCode, File } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function RagPanel({ isOpen, onClose }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) loadDocs();
  }, [isOpen]);

  const loadDocs = async () => {
    try {
      setDocuments(await getDocuments());
    } catch {}
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(''); setSuccess(''); setUploading(true);
    try {
      const doc = await uploadDocument(file);
      setDocuments(prev => [doc, ...prev]);
      setSuccess(`"${doc.original_name}" berhasil diupload (${doc.chunk_count} chunks)`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus "${name}"?`)) return;
    try {
      await deleteRagDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-stone-900 border-l border-stone-800 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800">
          <div>
            <h2 className="font-semibold text-stone-100 text-sm">Knowledge Base</h2>
            <p className="text-xs text-stone-500 mt-0.5">Upload dokumen untuk RAG</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Upload area */}
        <div className="p-4 border-b border-stone-800">
          <label className={`
            flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all
            ${uploading ? 'border-amber-400/40 bg-amber-400/5' : 'border-stone-700 hover:border-amber-400/40 hover:bg-stone-800/60'}
          `}>
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
                <span className="text-xs text-amber-400">Memproses dokumen...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-xs text-stone-400">Klik untuk upload</span>
                <span className="text-xs text-stone-600">PDF, TXT, MD, JSON, CSV</span>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".txt,.md,.pdf,.json,.csv,.js,.ts,.py"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>

          {error && (
            <p className="text-xs text-red-400 mt-2 flex gap-1 items-center">
              <AlertTriangle className="w-3.5 h-3.5" /> {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-emerald-400 mt-2 flex gap-1 items-center">
              <CheckCircle className="w-3.5 h-3.5" /> {success}
            </p>
          )}
        </div>

        {/* How it works */}
        <div className="px-4 py-3 border-b border-stone-800 bg-amber-400/5">
          <p className="text-xs text-amber-400/80 font-medium mb-1">Cara Kerja RAG</p>
          <p className="text-xs text-stone-500 leading-relaxed">
            Dokumen dipecah menjadi chunks → diindex dengan TF-IDF →
            saat kamu chat, chunk paling relevan otomatis diinjek ke prompt AI.
          </p>
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-stone-600 text-sm">
              <FileText className="w-8 h-8 mb-2 mx-auto" />
              <p>Belum ada dokumen</p>
            </div>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="flex items-start gap-3 p-3 bg-stone-800/60 border border-stone-700/50 rounded-xl group">
                <div className="w-8 h-8 bg-amber-400/10 rounded-lg flex items-center justify-center flex-shrink-0 text-amber-500">
                  {doc.original_name.endsWith('.pdf') ? <FileText className="w-4 h-4" /> :
                   doc.original_name.endsWith('.md') ? <FileCode className="w-4 h-4" /> : <File className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-stone-300 truncate">{doc.original_name}</p>
                  <p className="text-xs text-stone-600 mt-0.5">{doc.chunk_count} chunks</p>
                </div>
                <button
                  onClick={() => handleDelete(doc.id, doc.original_name)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 text-stone-600 rounded transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
