import { api } from './client';
import type { CategoryAnalytics, TimelineAnalytics } from '../types';

interface Range {
  dt_from?: string;
  dt_to?: string;
}

export const analyticsApi = {
  byCategory: (range: Range = {}) =>
    api.get<CategoryAnalytics>('/analytics/by-category', { params: range }),

  timeline: (range: Range & { granularity?: 'day' | 'week' | 'month' } = {}) =>
    api.get<TimelineAnalytics>('/analytics/timeline', { params: range }),
};