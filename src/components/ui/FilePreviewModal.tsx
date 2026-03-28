import React, { useEffect, useState } from 'react';
import { X, FileText, Table, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface FilePreviewModalProps {
  filename: string;
  isOpen: boolean;
  onClose: () => void;
}

interface SheetData {
  columns: string[];
  rows: string[][];
  total_rows: number;
  total_columns: number;
  error?: string;
}

interface FilePreview {
  filename: string;
  filepath: string;
  sheets: string[];
  sheet_data: Record<string, SheetData>;
  file_size: number;
  last_modified: string;
  preview_rows: number;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ filename, isOpen, onClose }) => {
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState<string>('');

  useEffect(() => {
    if (isOpen && filename) {
      fetchPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, filename]);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBase}/api/data-sources/preview/${encodeURIComponent(filename)}?rows=25`);
      if (!response.ok) {
        throw new Error('Failed to load file preview');
      }
      const data = await response.json();
      setPreview(data);
      if (data.sheets && data.sheets.length > 0) {
        setActiveSheet(data.sheets[0]);
      }
    } catch (err) {
      setError('Failed to load file preview');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!isOpen) return null;

  const currentSheetData = preview?.sheet_data?.[activeSheet];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-aza-gold to-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{filename}</h2>
                {preview && (
                  <p className="text-sm text-gray-500">
                    {formatFileSize(preview.file_size)} • Last modified: {format(new Date(preview.last_modified), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                <span className="ml-3 text-gray-600">Loading file preview...</span>
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center text-red-600">
                {error}
              </div>
            ) : preview ? (
              <>
                {/* Sheet Tabs */}
                {preview.sheets.length > 1 && (
                  <div className="px-4 py-2 border-b border-gray-200 flex gap-2 overflow-x-auto bg-gray-50">
                    {preview.sheets.map((sheet) => (
                      <button
                        key={sheet}
                        onClick={() => setActiveSheet(sheet)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                          activeSheet === sheet
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <Table className="w-4 h-4 inline mr-2" />
                        {sheet}
                      </button>
                    ))}
                  </div>
                )}

                {/* Data Preview Info */}
                {currentSheetData && !currentSheetData.error && (
                  <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-sm text-blue-700">
                    Showing {Math.min(preview.preview_rows, currentSheetData.total_rows)} of {currentSheetData.total_rows.toLocaleString()} rows • {currentSheetData.total_columns} columns
                  </div>
                )}

                {/* Data Table */}
                <div className="flex-1 overflow-auto">
                  {currentSheetData?.error ? (
                    <div className="p-8 text-center text-red-600">
                      Error loading sheet: {currentSheetData.error}
                    </div>
                  ) : currentSheetData ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-200 sticky left-0">
                            #
                          </th>
                          {currentSheetData.columns.map((col, i) => (
                            <th 
                              key={i}
                              className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentSheetData.rows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-xs text-gray-400 bg-gray-50 sticky left-0">
                              {rowIndex + 1}
                            </td>
                            {row.map((cell, cellIndex) => (
                              <td 
                                key={cellIndex}
                                className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap max-w-xs truncate"
                                title={cell}
                              >
                                {cell || <span className="text-gray-300">—</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Data preview (first {preview?.preview_rows || 25} rows)
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
