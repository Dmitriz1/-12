import { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { aiApi } from '../api/ai';
import { extractErrorMessage } from '../api/client';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../utils/format';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export function Analytics() {
  const { byCategory, timeline, loading, error } = useAnalytics();
  const [ai, setAi] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const loadRecommendations = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const { data } = await aiApi.recommendations();
      setAi(data.recommendations);
    } catch (err) {
      setAiError(extractErrorMessage(err));
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error)
    return (
      <p role="alert" className="form__server-error">
        {error}
      </p>
    );

  const total = byCategory?.values.reduce((s, v) => s + v, 0) ?? 0;

  return (
    <div className="page">
      <h1>Аналитика</h1>

      <section className="analytics-section">
        <h2>Расходы по категориям</h2>
        {byCategory && byCategory.labels.length > 0 ? (
          <>
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Категория</th>
                  <th>Сумма</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {byCategory.labels.map((label, i) => {
                  const value = byCategory.values[i];
                  const pct = total ? ((value / total) * 100).toFixed(1) : '0';
                  return (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>{formatCurrency(value)}</td>
                      <td>{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <img
              className="analytics-chart"
              src={`${API_BASE}/analytics/by-category/chart.png`}
              alt="Круговая диаграмма расходов"
            />
          </>
        ) : (
          <p className="empty-state">Нет данных за период</p>
        )}
      </section>

      <section className="analytics-section">
        <h2>Динамика доходов и расходов</h2>
        {timeline && timeline.labels.length > 0 ? (
          <img
            className="analytics-chart"
            src={`${API_BASE}/analytics/timeline/chart.png?kind=line&granularity=day`}
            alt="График динамики"
          />
        ) : (
          <p className="empty-state">Нет данных за период</p>
        )}
      </section>

      <section className="analytics-section">
        <h2>🤖 AI-рекомендации</h2>
        <Button onClick={loadRecommendations} disabled={aiLoading}>
          {aiLoading ? 'Загрузка...' : 'Получить рекомендации'}
        </Button>
        {aiError && (
          <p role="alert" className="form__server-error">
            {aiError}
          </p>
        )}
        {ai && <div className="ai-panel">{ai}</div>}
      </section>
    </div>
  );
}