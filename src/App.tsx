import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ExecutiveSummary } from './pages/ExecutiveSummary';
import { StorePerformance } from './pages/StorePerformance';
import { SalesAnalytics } from './pages/SalesAnalytics';
import { CustomerIntelligence } from './pages/CustomerIntelligence';
import { PlatformPerformance } from './pages/PlatformPerformance';
import { PredictiveInsights } from './pages/PredictiveInsights';
import { DataLineage } from './pages/DataLineage';
import { Settings } from './pages/Settings';
import MarketingROI from './pages/MarketingROI';
import ReputationManagement from './pages/ReputationManagement';
import OperationalExcellence from './pages/OperationalExcellence';
import CustomerJourney from './pages/CustomerJourney';
import MenuIntelligence from './pages/MenuIntelligence';
import { LoadingOverlay } from './components/ui/Loading';
import { analyticsApi } from './services/api';
import { AIIntelligence } from './pages/AIIntelligence';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { CommandBarProvider } from './components/CommandBar/CommandBarProvider';
import { CommandBar } from './components/CommandBar/CommandBar';

function App() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await analyticsApi.refreshData();
      // Reload the page to fetch fresh data
      window.location.reload();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <AuthProvider>
      <Router>
        <CommandBarProvider>
          <CommandBar />
          {refreshing && <LoadingOverlay message="Refreshing data..." />}
          <Routes>
          {/* Auth routes - public */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Main dashboard routes - protected */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout onRefresh={handleRefresh} />
            </ProtectedRoute>
          }>
            <Route index element={<ExecutiveSummary />} />
            <Route path="stores" element={<StorePerformance />} />
            <Route path="sales" element={<SalesAnalytics />} />
            <Route path="customers" element={<CustomerIntelligence />} />
            <Route path="platforms" element={<PlatformPerformance />} />
            <Route path="predictive" element={<PredictiveInsights />} />
            <Route path="marketing" element={<MarketingROI />} />
            <Route path="reputation" element={<ReputationManagement />} />
            <Route path="operations" element={<OperationalExcellence />} />
            <Route path="customer-journey" element={<CustomerJourney />} />
            <Route path="menu" element={<MenuIntelligence />} />
            <Route path="data-sources" element={<DataLineage />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* AI Intelligence Mode - also protected */}
          <Route path="/ai" element={
            <ProtectedRoute>
              <AIIntelligence />
            </ProtectedRoute>
          } />
          </Routes>
        </CommandBarProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;