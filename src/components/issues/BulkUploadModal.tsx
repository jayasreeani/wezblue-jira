'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import * as XLSX from 'xlsx';
import { 
  X, UploadCloud, FileSpreadsheet, Download, 
  CheckCircle2, AlertCircle, ArrowRight, Zap, Bookmark, Layers 
} from 'lucide-react';

interface ParsedStoryRow {
  epicName: string;
  feature: string;
  userStory: string;
  acceptanceCriteria: string;
  phase: string;
  isValid: boolean;
  error?: string;
}

export default function BulkUploadModal() {
  const { 
    isBulkUploadOpen, setIsBulkUploadOpen, currentProject, 
    epics, sprints, bulkImportStories 
  } = useApp();

  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStoryRow[]>([]);
  const [targetSprintId, setTargetSprintId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isBulkUploadOpen) return null;

  // Handle template download
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Epic / Module': 'Account & Profile',
        'Feature': 'Login via mobile OTP / email',
        'User Story': "As a resident, I want to log in with a one-time code sent to my mobile or email, so that I don't need to remember a password.",
        'Acceptance Criteria': "1. Given I enter a registered mobile/email, when I request a code, then a 6-digit OTP is sent within 30 seconds and expires after 5 minutes\n2. Given I enter a wrong OTP 5 times, when I try again, then login is blocked for 15 minutes and I see a clear message\n3. Given I enter an unregistered number, when I request a code, then I am told to use my invite or request to join a society\n4. Given I choose 'remember this device', when I reopen the app within 30 days, then I stay logged in",
        'Phase': 'MVP',
      },
      {
        'Epic / Module': 'Account & Profile',
        'Feature': 'Biometric & Quick Login',
        'User Story': 'As a resident, I want to authenticate using device biometrics (Face ID or fingerprint), so that I can access the app with minimal delay.',
        'Acceptance Criteria': '1. Given device biometric is registered, when I open app, then prompt biometric challenge\n2. Given biometric succeeds, when verified, then immediately navigate to Dashboard',
        'Phase': 'Phase 1',
      },
      {
        'Epic / Module': 'Billing & Invoicing',
        'Feature': 'Automated Maintenance Invoices',
        'User Story': 'As a society accountant, I want monthly maintenance bills generated on the 1st of each month, so that dues are invoiced on time.',
        'Acceptance Criteria': '1. Given active units, when 1st of month triggers, then compute dues based on square footage\n2. Given invoice created, when dispatched, then send notification to resident',
        'Phase': 'MVP',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Auto-fit column widths
    worksheet['!cols'] = [
      { wch: 22 }, // Epic / Module
      { wch: 30 }, // Feature
      { wch: 60 }, // User Story
      { wch: 75 }, // Acceptance Criteria
      { wch: 15 }, // Phase
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'User Stories');
    XLSX.writeFile(workbook, `${currentProject.key}_User_Stories_Template.xlsx`);
  };

  const processFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    try {
      const buffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

      const mapped: ParsedStoryRow[] = rawJson.map((row) => {
        // Flexible key matching to tolerate variations in header capitalization or spaces
        const getVal = (possibleKeys: string[]) => {
          for (const key of possibleKeys) {
            const foundKey = Object.keys(row).find(
              k => k.toLowerCase().replace(/[\s\/\_\-]/g, '') === key.toLowerCase().replace(/[\s\/\_\-]/g, '')
            );
            if (foundKey && String(row[foundKey]).trim()) {
              return String(row[foundKey]).trim();
            }
          }
          return '';
        };

        const epicName = getVal(['Epic / Module', 'Epic/Module', 'Epic', 'Module']);
        const feature = getVal(['Feature', 'Feature Name', 'Component']);
        const userStory = getVal(['User Story', 'UserStory', 'Story', 'Summary', 'Narrative', 'Requirement']);
        const acceptanceCriteria = getVal(['Acceptance Criteria', 'AcceptanceCriteria', 'AC', 'Criteria']);
        const phase = getVal(['Phase', 'Release Phase', 'Target Phase']) || 'MVP';

        const isValid = userStory.length > 0;
        return {
          epicName,
          feature,
          userStory,
          acceptanceCriteria,
          phase,
          isValid,
          error: !isValid ? 'User Story narrative is required' : undefined,
        };
      });

      setParsedRows(mapped);
    } catch (err) {
      console.error('Failed to parse excel file:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) return;

    setIsProcessing(true);
    const result = await bulkImportStories({
      projectId: currentProject.id,
      sprintId: targetSprintId || undefined,
      stories: validRows.map(r => ({
        epicName: r.epicName,
        feature: r.feature,
        userStory: r.userStory,
        acceptanceCriteria: r.acceptanceCriteria,
        phase: r.phase,
      })),
    });

    setIsProcessing(false);
    if (result.success) {
      setIsBulkUploadOpen(false);
      setFile(null);
      setParsedRows([]);
    }
  };

  // Analyze epics from parsed rows
  const uniqueEpics = Array.from(new Set(parsedRows.map(r => r.epicName).filter(Boolean)));
  const existingEpicNames = epics.map(e => e.name.toLowerCase().trim());
  const epicsToCreate = uniqueEpics.filter(name => !existingEpicNames.includes(name.toLowerCase().trim()));
  const validStoriesCount = parsedRows.filter(r => r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-jira-border flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-jira-border flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-xs border border-emerald-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-jira-text">
                Bulk Upload User Stories via Excel / CSV
              </h2>
              <p className="text-xs text-jira-subtle mt-0.5">
                Target Project: <span className="font-bold text-jira-brand">{currentProject.name} ({currentProject.key})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-xs transition"
              title="Download pre-formatted Excel template"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Excel Template</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsBulkUploadOpen(false);
                setFile(null);
                setParsedRows([]);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Upload Drop Zone (if no file chosen or to replace) */}
          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 ${
                isDragging 
                  ? 'border-jira-brand bg-blue-50/50 scale-[0.99]' 
                  : 'border-slate-300 hover:border-jira-brand hover:bg-slate-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Click to browse or drag and drop your Excel / CSV file
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports <span className="font-semibold text-slate-700">.xlsx, .xls, and .csv</span> files matching the standard Agile Hierarchy.
                </p>
              </div>

              {/* Supported Columns Pill Row */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-semibold text-slate-600">
                <span className="px-2.5 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  Epic / Module
                </span>
                <span className="text-slate-300">➔</span>
                <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Feature
                </span>
                <span className="text-slate-300">➔</span>
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                  User Story
                </span>
                <span className="text-slate-300">➔</span>
                <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Acceptance Criteria (Given / When / Then)
                </span>
                <span className="text-slate-300">➔</span>
                <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Phase (MVP, Phase 1, etc.)
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info & Configuration Bar */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800 text-sm flex items-center space-x-2">
                      <span>{file.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                        {Math.round(file.size / 1024)} KB
                      </span>
                    </div>
                    <div className="text-slate-500 font-medium">
                      Parsed <b>{validStoriesCount}</b> user stories • <b>{uniqueEpics.length}</b> distinct Epics
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Destination Sprint Selection */}
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-600">Target Sprint:</span>
                    <select
                      value={targetSprintId}
                      onChange={e => setTargetSprintId(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 outline-none"
                    >
                      <option value="">Product Backlog</option>
                      {sprints.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setParsedRows([]);
                    }}
                    className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-bold transition"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Epic Provisioning Insights */}
              <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-purple-950 font-bold">
                  <Zap className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>
                    Agile Epics Provisioning: <b>{uniqueEpics.length}</b> total ({uniqueEpics.length - epicsToCreate.length} matched existing, 
                    <span className="text-purple-700"> {epicsToCreate.length} will be automatically created</span>)
                  </span>
                </div>
                {epicsToCreate.length > 0 && (
                  <div className="flex items-center space-x-1 flex-wrap">
                    {epicsToCreate.map((e, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white border border-purple-200 text-purple-800 text-[10px] font-bold rounded">
                        + {e}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactive Parsed Data Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="max-h-[380px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs border-b border-slate-200 z-10">
                      <tr className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                        <th className="py-2.5 px-3 w-10">#</th>
                        <th className="py-2.5 px-3 w-36">Epic / Module</th>
                        <th className="py-2.5 px-3 w-40">Feature</th>
                        <th className="py-2.5 px-3">User Story Narrative</th>
                        <th className="py-2.5 px-3 w-56">Acceptance Criteria</th>
                        <th className="py-2.5 px-3 w-20">Phase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.map((row, idx) => (
                        <tr 
                          key={idx} 
                          className={`hover:bg-slate-50 transition ${!row.isValid ? 'bg-red-50/40' : ''}`}
                        >
                          <td className="py-2.5 px-3 text-slate-400 font-bold">{idx + 1}</td>
                          
                          {/* Epic */}
                          <td className="py-2.5 px-3">
                            {row.epicName ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-bold border border-purple-200 text-[10px] max-w-[130px] truncate">
                                <Zap className="w-2.5 h-2.5 text-purple-600 flex-shrink-0" />
                                <span className="truncate">{row.epicName}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[10px]">None</span>
                            )}
                          </td>

                          {/* Feature */}
                          <td className="py-2.5 px-3 font-semibold text-blue-900">
                            {row.feature ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] max-w-[150px] truncate" title={row.feature}>
                                📁 <span className="truncate">{row.feature}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[10px]">None</span>
                            )}
                          </td>

                          {/* Narrative */}
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800 leading-snug line-clamp-2">
                              {row.userStory || <span className="text-red-500 font-bold">Missing required User Story</span>}
                            </div>
                          </td>

                          {/* Acceptance Criteria */}
                          <td className="py-2.5 px-3">
                            {row.acceptanceCriteria ? (
                              <div className="text-[11px] text-slate-600 font-mono line-clamp-2 leading-relaxed" title={row.acceptanceCriteria}>
                                {row.acceptanceCriteria}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[10px]">None</span>
                            )}
                          </td>

                          {/* Phase */}
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {row.phase}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-jira-border bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {parsedRows.length > 0 ? (
              <span>Ready to import <b>{validStoriesCount}</b> user stories into <b>{currentProject.name}</b>.</span>
            ) : (
              <span>Upload an Excel spreadsheet or download the pre-formatted template.</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsBulkUploadOpen(false);
                setFile(null);
                setParsedRows([]);
              }}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={validStoriesCount === 0 || isProcessing}
              onClick={handleImport}
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-white bg-jira-brand hover:bg-jira-brandHover rounded-lg transition disabled:opacity-50 shadow-sm"
            >
              {isProcessing ? (
                <span>Importing Stories...</span>
              ) : (
                <>
                  <span>Import {validStoriesCount} User Stories</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
