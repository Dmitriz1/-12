import { useState } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { aiApi } from '../../api/ai';
import { extractErrorMessage } from '../../api/client';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Table, type Column } from '../../components/ui/Table';
import { formatCurrency } from '../../utils/format';
import shared from '../../styles/shared.module.css';
import styles from './Analytics.module.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

interface CategoryRow {
  category: string;
  amount: number;
  percent: string;
}

const columns: Column<CategoryRow>[] = [
  { key: 'category', title: 'Категория' },
  {
    key: 'amount',
    title: 'Сумма',
    render: (value) => formatCurrency(value as number),
  },
  { key: 'percent', title: '%' },
];

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
      <p role="alert" className={shared.serverError}>
        {error}
      </p>
    );

  const total = byCategory?.values.reduce((s, v) => s + v, 0) ?? 0;

  const rows: CategoryRow[] = (byCategory?.labels ?? []).map((label, i) => {
    const value = byCategory?.values[i] ?? 0;
    return {
      category: label,
      amount: value,
      percent: `${total ? ((value / total) * 100).toFixed(1) : '0'}%`,
    };
  });

  return (
    <div>
      <h1 className={styles.title}>Аналитика</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Расходы по категориям</h2>
        {byCategory && byCategory.labels.length > 0 ? (
          <>
            <Table columns={columns} data={rows} rowKey={(row) => row.category} />
            <img
              className={styles.chart}
              src={`${API_BASE}/analytics/by-category/chart.png`}
              alt="Круговая диаграмма расходов"
            />
          </>
        ) : (
          <p className={shared.emptyState}>Нет данных за период</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Динамика доходов и расходов</h2>
        {timeline && timeline.labels.length > 0 ? (
          <img
            className={styles.chart}
            src={`${API_BASE}/analytics/timeline/chart.png?kind=line&granularity=day`}
            alt="График динамики"
          />
        ) : (
          <p className={shared.emptyState}>Нет данных за период</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🤖 AI-рекомендации</h2>
        <Button onClick={loadRecommendations} disabled={aiLoading}>
          {aiLoading ? 'Загрузка...' : 'Получить рекомендации'}
        </Button>
        {aiError && (
          <p role="alert" className={shared.serverError}>
            {aiError}
          </p>
        )}
        {ai && <div className={styles.panel}>{ai}</div>}
      </section>
    </div>
  );
}
