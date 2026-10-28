import axios from 'axios';
import type { AnalysisRecord, WaveformLeadData } from '../types';


const API_BASE = '/api';

export const ecgApi = {
  getHealth: async () => {
    const res = await axios.get(`${API_BASE}/health`);
    return res.data;
  },

  getModelStatus: async () => {
    const res = await axios.get(`${API_BASE}/model/status`);
    return res.data;
  },

  uploadECG: async (formData: FormData): Promise<AnalysisRecord> => {
    const res = await axios.post(`${API_BASE}/ecg/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  loadDemo: async (variant: string = 'normal'): Promise<AnalysisRecord> => {
    const res = await axios.post(`${API_BASE}/demo/load?variant=${variant}`);
    return res.data;
  },

  listAnalyses: async (): Promise<AnalysisRecord[]> => {
    const res = await axios.get(`${API_BASE}/analyses`);
    return res.data;
  },

  getAnalysis: async (id: string): Promise<AnalysisRecord> => {
    const res = await axios.get(`${API_BASE}/analyses/${id}`);
    return res.data;
  },

  deleteAnalysis: async (id: string): Promise<{ status: string; id: string }> => {
    const res = await axios.delete(`${API_BASE}/analyses/${id}`);
    return res.data;
  },

  getWaveform: async (id: string, lead: string = 'Lead II'): Promise<WaveformLeadData> => {
    const res = await axios.get(`${API_BASE}/analyses/${id}/waveform`, {
      params: { lead },
    });
    return res.data;
  },

  getReportUrl: (id: string) => `${API_BASE}/analyses/${id}/report`,
  getImageUrl: (id: string) => `${API_BASE}/analyses/${id}/image`,
};

