import React, { useEffect, useState } from 'react';
import { X, FileText, Calendar, Database, Info, CheckCircle, AlertCircle, Brain, Target, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { analyticsApi } from '../../services/api';
import { Loading } from './Loading';
import { clsx } from 'clsx';

interface DataSourceModalProps {
  metric: string;
  isOpen: boolean;
  onClose: () => void;
}

interface DataLineage {
  display_name: string;
  source_files: Array<{
    filename: string;
    sheet: string;
    columns: string[];
    calculation: string;
    filters?: string;
    date_range?: string;
    update_frequency: string;
  }>;
  confidence_level: string;
  notes: string;
  last_updated: string;
  data_quality_indicators?: {
    high: { description: string; color: string };
    medium: { description: string; color: string };
    low: { description: string; color: string };
  };
  model_accuracy?: {
    mape: string;
    mape_description: string;
    r_squared: string;
    r_squared_description: string;
    training_samples: number;
    features_used: string[];
    model_type: string;
    cross_validation: string;
  };
}

export const DataSourceModal: React.FC<DataSourceModalProps> = ({ metric, isOpen, onClose }) => {
  const [lineage, setLineage] = useState<DataLineage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && metric) {
      fetchDataLineage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, metric]);

  const fetchDataLineage = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsApi.getDataLineage(metric);
      setLineage(response as DataLineage);
    } catch (err) {
      setError('Failed to load data source information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getConfidenceIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <CheckCircle className="w-5 h-5 text-aza-sage" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-aza-coral" />;
      default:
        return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-aza-sage bg-aza-sage/10';
      case 'medium':
        return 'text-aza-coral bg-aza-coral/10';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-aza-gold to-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Data Source Information</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {loading ? (
              <Loading size="lg" className="h-32" />
            ) : error ? (
              <div className="text-red-600 text-center py-8">{error}</div>
            ) : lineage ? (
              <div className="space-y-6">
                {/* Metric Name */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {lineage.display_name}
                  </h3>
                  <p className="text-sm text-gray-600">{lineage.notes}</p>
                </div>

                {/* Confidence Level */}
                <div className="flex items-center gap-2">
                  {getConfidenceIcon(lineage.confidence_level)}
                  <span className={clsx(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    getConfidenceColor(lineage.confidence_level)
                  )}>
                    {lineage.confidence_level.charAt(0).toUpperCase() + lineage.confidence_level.slice(1)} Confidence
                  </span>
                  {lineage.data_quality_indicators?.[lineage.confidence_level as keyof typeof lineage.data_quality_indicators] && (
                    <span className="text-sm text-gray-500">
                      - {lineage.data_quality_indicators[lineage.confidence_level as keyof typeof lineage.data_quality_indicators].description}
                    </span>
                  )}
                </div>

                {/* Source Files */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Data Sources
                  </h4>
                  <div className="space-y-4">
                    {(lineage.source_files || []).map((source, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start gap-3">
                          <FileText className="w-5 h-5 text-aza-navy mt-0.5" />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-2">{source.filename}</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-500">Sheet:</span>
                                <span className="ml-2 text-gray-900">{source.sheet}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Update Frequency:</span>
                                <span className="ml-2 text-gray-900">{source.update_frequency}</span>
                              </div>
                              {source.date_range && (
                                <div className="md:col-span-2">
                                  <span className="text-gray-500">Date Range:</span>
                                  <span className="ml-2 text-gray-900">{source.date_range}</span>
                                </div>
                              )}
                              <div className="md:col-span-2">
                                <span className="text-gray-500">Columns Used:</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {(source.columns || []).map((col, i) => (
                                    <span key={i} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                                      {col}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-gray-500">Calculation:</span>
                                <p className="mt-1 text-gray-900">{source.calculation}</p>
                              </div>
                              {source.filters && (
                                <div className="md:col-span-2">
                                  <span className="text-gray-500">Filters Applied:</span>
                                  <p className="mt-1 text-gray-900">{source.filters}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Model Accuracy - Show for ML models */}
                {lineage.model_accuracy && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-600" />
                      Model Accuracy
                    </h4>
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* MAPE */}
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">MAPE</span>
                          </div>
                          <p className="text-2xl font-bold text-green-600">{lineage.model_accuracy.mape}</p>
                          <p className="text-xs text-gray-500 mt-1">{lineage.model_accuracy.mape_description}</p>
                        </div>
                        {/* R² Score */}
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">R² Score</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-600">{lineage.model_accuracy.r_squared}</p>
                          <p className="text-xs text-gray-500 mt-1">{lineage.model_accuracy.r_squared_description}</p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Model Type:</span>
                          <p className="font-medium text-gray-900">{lineage.model_accuracy.model_type}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Training Samples:</span>
                          <p className="font-medium text-gray-900">{lineage.model_accuracy.training_samples} months</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Validation:</span>
                          <p className="font-medium text-gray-900">{lineage.model_accuracy.cross_validation}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Features Used:</span>
                          <p className="font-medium text-gray-900">{lineage.model_accuracy.features_used.length}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-gray-500 text-sm">Features:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {lineage.model_accuracy.features_used.map((feature, i) => (
                            <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Last Updated */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Metadata last updated: {
                      lineage.last_updated && lineage.last_updated !== 'Unknown'
                        ? format(new Date(lineage.last_updated), 'MMM dd, yyyy HH:mm')
                        : 'Unknown'
                    }
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};