import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import { FilePreviewModal } from '../components/ui/FilePreviewModal';
import { analyticsApi } from '../services/api';
import { FileText, Database, Calendar, CheckCircle, AlertCircle, Info, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface DataSource {
  filename: string;
  metrics: string[];
  sheets: string[];
  update_frequency: string;
  last_modified: string;
}

interface DataSourcesResponse {
  sources: Record<string, DataSource>;
  total_sources: number;
  last_metadata_update: string;
  data_quality_indicators: {
    high: { description: string; color: string };
    medium: { description: string; color: string };
    low: { description: string; color: string };
  };
}

export const DataLineage: React.FC = () => {
  const [data, setData] = useState<DataSourcesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getDataSources();
      setData(response as DataSourcesResponse);
    } catch (err) {
      setError('Failed to load data sources');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading size="lg" className="h-full" />;
  if (error || !data) return <div className="p-8 text-red-600">{error}</div>;

  const getQualityIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <CheckCircle className="w-5 h-5 text-aza-sage" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-aza-coral" />;
      default:
        return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <>
      <Header
        title="Data Sources & Lineage"
        subtitle="Complete transparency of our data pipeline"
      />

      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        {/* Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-aza-gold to-orange-50 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-aza-coral" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.total_sources}</p>
                <p className="text-sm text-gray-600">Data Sources</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-aza-gold to-green-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-aza-sage" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {data.last_metadata_update && data.last_metadata_update !== 'Unknown'
                    ? format(new Date(data.last_metadata_update), 'MMM dd')
                    : 'Unknown'}
                </p>
                <p className="text-sm text-gray-600">Last Updated</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 mb-3">Data Quality</h3>
              {Object.entries(data.data_quality_indicators).map(([level, info]) => (
                <div key={level} className="flex items-start gap-2">
                  {getQualityIcon(level)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 capitalize">{level}</p>
                    <p className="text-xs text-gray-600">{info.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Data Sources List */}
        <Card title="All Data Sources" subtitle="Click on any source to preview its data">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sheets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Update Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metrics Powered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.values(data.sources).map((source, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedFile(source.filename)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{source.filename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {source.sheets.map((sheet, i) => (
                          <span key={i} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {sheet}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{source.update_frequency}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {source.metrics.slice(0, 3).map((metric, i) => (
                          <span key={i} className="px-2 py-1 text-xs bg-aza-gold text-gray-800 rounded">
                            {metric}
                          </span>
                        ))}
                        {source.metrics.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{source.metrics.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(source.filename);
                        }}
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Data Flow Diagram Placeholder */}
        <Card title="Data Flow" subtitle="How data flows from sources to dashboard" className="mt-8">
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Data flows from Excel files → Python analytics scripts → JSON/CSV reports → API aggregation → Dashboard visualization
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <span>Excel Files</span>
                <span>→</span>
                <span>Analytics Engine</span>
                <span>→</span>
                <span>API</span>
                <span>→</span>
                <span>Dashboard</span>
              </div>
            </div>
          </div>
        </Card>
      </main>

      {/* File Preview Modal */}
      {selectedFile && (
        <FilePreviewModal
          filename={selectedFile}
          isOpen={!!selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </>
  );
};