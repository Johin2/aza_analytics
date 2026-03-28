import { StoreAnalyticsSummary, StoreDetails, ComparativeAnalysis } from '../types/stores';
import { MOCK_STORES_DATA, MOCK_STORE_DETAIL } from './mock-data';

export const storeApi = {
  getStoresSummary: async (year: number = 2025, month: number = 0): Promise<{
    summary: StoreAnalyticsSummary;
    comparative_analysis: ComparativeAnalysis;
    generated_at: string;
  }> => {
    return MOCK_STORES_DATA as any;
  },

  getStoreDetails: async (storeName: string): Promise<StoreDetails> => {
    return MOCK_STORE_DETAIL(storeName) as any;
  },
};
