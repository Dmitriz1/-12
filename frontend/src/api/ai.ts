import { api } from './client';
import type { AiRecommendations } from '../types';

export const aiApi = {
  recommendations: () => api.get<AiRecommendations>('/ai/recommendations'),
};