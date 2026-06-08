import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertTriangle, FileUp, Sparkles, CheckCircle2 } from 'lucide-react';

interface ResumeUploaderProps {
  onUploadSuccess: (fileContent: { text?: string; base64?: string }, fileName: string) => Promise<void>;
  isLoading?: boolean;
  currentFileName?: string;
}

export default function ResumeUploader({ onUploadSuccess, isLoading = false, currentFileName }: ResumeUploaderProps) {
  const [resumeText, setResumeText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    const lowercaseName = file.name.toLowerCase();
    
    // Check files to ensure only actual resumes are uploaded
    const isText = file.type === 'text/plain' || lowercaseName.endsWith('.txt') || lowercaseName.endsWith('.md');
    const isPdf = file.type === 'application/pdf' || lowercaseName.endsWith('.pdf');
    const isDoc = file.type === 'application/msword' || lowercaseName.endsWith('.doc');
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || lowercaseName.endsWith('.docx');

    // Strict filename check for resumes
    const matchesKeyword = lowercaseName.includes('resume') || 
                           lowercaseName.includes('cv') || 
                           lowercaseName.includes('curriculum') || 
                           lowercaseName.includes('portfolio') || 
                           lowercaseName.includes('profile') || 
                           lowercaseName.includes('mercer') ||
                           lowercaseName.includes('upreti');

    if (!matchesKeyword || (!isText && !isPdf && !isDoc && !isDocx)) {
      setError("Please upload the Resume only. I wont analyze this document.");
      return;
    }

    const reader = new FileReader();
    if (isText) {
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        if (text) {
          await onUploadSuccess({ text }, file.name);
        }
      };
      reader.onerror = () => {
        setError('Failed to properly parse file.');
      };
      reader.readAsText(file);
    } else {
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        if (result) {
          const base64 = result.split(',')[1];
          await onUploadSuccess({ base64 }, file.name);
        }
      };
      reader.onerror = () => {
        setError('Failed to read binary file data.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!resumeText.trim()) {
      setError('Please insert some resume text for parsing.');
      return;
    }
    await onUploadSuccess({ text: resumeText }, 'pasted_resume.txt');
  };

  return (
    <div className="space-y-5 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Resume intelligence source</h3>
        </div>
        <button
          type="button"
          onClick={() => setManualInput(!manualInput)}
          className="text-xs text-indigo-600 underline font-semibold hover:text-indigo-850 transition-colors cursor-pointer"
        >
          {manualInput ? 'Switch to text upload' : 'Switch to direct copy/paste'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div className="font-semibold">{error}</div>
        </div>
      )}

      {currentFileName && !isLoading && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <div className="font-semibold">
            Active profile resume: <span className="font-bold underline text-slate-900">{currentFileName}</span>
          </div>
        </div>
      )}

      {manualInput ? (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-500 mb-2">
              Paste Copy of Complete Resume Text
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={8}
              required
              className="w-full bg-slate-50 p-4 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all placeholder:text-slate-400 font-mono resize-none shadow-inner"
              placeholder={`ALEX MERCER - Full Stack Developer
alex.mercer@gmail.com | 555-0199

SKILLS: React, Node, Express, TypeScript, SQL, LLM APIs
EXPERIENCE:
- Sr. Software Engineer at Vortex (2024-Present)
  Built custom vector search layouts improving load score by 40%...`}
            />
          </div>
          <button
            id="text-resume-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-indigo-100"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analyzing & Indexing candidate...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                Analyze Paste & Score Profile
              </>
            )}
          </button>
        </form>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-indigo-600 bg-indigo-50/50'
              : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".txt,.md,.pdf,.doc,.docx"
            className="hidden"
          />
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <svg className="animate-spin h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <div className="text-sm font-bold text-slate-700">AI Parser Running ATS scoring parameters...</div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <FileUp className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-800">Drag & drop resume, or browse files</p>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">Supports PDF, Word (.docx, .doc), and Text/MD files</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
