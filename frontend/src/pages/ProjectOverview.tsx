import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services';
import { useTranslation } from 'react-i18next';

interface ProjectData {
  project: {
    id: number;
    name: string;
    custom_id: string;
    status: string;
    start_date: string;
    planned_end_date: string;
  };
  summary: {
    total_shifts: number;
    total_shift_hours: number;
    completed_shifts: number;
    planned_shifts: number;
    in_progress_shifts: number;
    cancelled_shifts: number;
    total_extra_works: number;
    approved_extra_works: number;
    waiting_foreman: number;
    waiting_manager: number;
    returned_extra_works: number;
    unique_material_types: number;
    total_material_quantity: number;
    total_material_cost: number;
    avg_material_cost_per_shift: number;
    avg_material_cost_per_extra_work: number;
  };
  top_materials: Array<{
    id: number;
    name: string;
    unit: string;
    total_quantity: number;
    total_cost: number;
    used_in_extra_works: number;
  }>;
  monthly_trends: Array<{
    month_key: string;
    label: string;
    shifts_count: number;
    shift_hours: number;
    extra_work_count: number;
    material_cost: number;
  }>;
}

const ProjectOverview: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setError('ID projektu chybí');
      setLoading(false);
      return;
    }

    loadOverview();
  }, [projectId]);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const result = await projectService.getOverview(Number(projectId));
      setData(result);
    } catch (err: any) {
      console.error('Chyba při načítání přehledu:', err);
      if (err.response?.status === 403) {
        setError('Nemáte oprávnění k tomuto projektu');
      } else if (err.response?.status === 404) {
        setError('Projekt nenalezen');
      } else {
        setError('Chyba při načítání dat projektu');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Chyba při načítání dat'}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
        >
          ← Zpět
        </button>
      </div>
    );
  }

  const { project, summary, top_materials, monthly_trends } = data;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('cs-CZ', { 
      style: 'currency', 
      currency: 'CZK',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'preparation': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'in_progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'paused': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const maxMonthlyShifts = Math.max(...monthly_trends.map(m => m.shifts_count), 1);
  const maxMonthlyCost = Math.max(...monthly_trends.map(m => m.material_cost), 1);

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              📊 Přehled projektu
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {project.custom_id} - {project.name}
            </p>
          </div>
          <span className={`badge-glass px-4 py-2 text-lg font-semibold ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Shifts */}
        <div className="glass-card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Celkem směn</h3>
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{summary.total_shifts}</p>
          <div className="mt-3 text-xs space-y-1">
            <p className="text-green-600 dark:text-green-400">✓ {summary.completed_shifts} hotových</p>
            <p className="text-yellow-600 dark:text-yellow-400">⧗ {summary.in_progress_shifts} v průběhu</p>
          </div>
        </div>

        {/* Shift Hours */}
        <div className="glass-card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Hodin práce</h3>
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{summary.total_shift_hours.toFixed(1)}</p>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Ø {(summary.total_shift_hours / Math.max(summary.total_shifts, 1)).toFixed(1)} h/směna
          </p>
        </div>

        {/* Extra Works */}
        <div className="glass-card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Vícepráce</h3>
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{summary.total_extra_works}</p>
          <div className="mt-3 text-xs space-y-1">
            <p className="text-green-600 dark:text-green-400">✓ {summary.approved_extra_works} schválených</p>
            <p className="text-orange-600 dark:text-orange-400">⟲ {summary.returned_extra_works} vrácených</p>
          </div>
        </div>

        {/* Material Cost */}
        <div className="glass-card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Náklady na materiál</h3>
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.total_material_cost)}</p>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {summary.unique_material_types} typů materiálu
          </p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ø náklady / směnu</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.avg_material_cost_per_shift)}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ø náklady / vícepráci</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.avg_material_cost_per_extra_work)}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Čekající schválení</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary.waiting_foreman + summary.waiting_manager}
          </p>
        </div>
      </div>

      {/* All Materials */}
      <div className="glass-card p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></div>
          Všechny použité materiály
        </h3>
        <div className="space-y-4">
          {top_materials.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Žádné materiály ve vícepracích</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-white/10 dark:divide-gray-700/50">
                <thead className="bg-gray-50/50 dark:bg-gray-700/20">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300">Materiál</th>
                    <th className="text-right px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300">Množství</th>
                    <th className="text-right px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300">Jednotka</th>
                    <th className="text-right px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300">Náklady</th>
                    <th className="text-center px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300">V vícepracích</th>
                    <th className="text-right px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300">% z celku</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 dark:divide-gray-700/50">
                  {top_materials.map((material) => {
                    const percentOfTotal = summary.total_material_cost > 0 
                      ? (material.total_cost / summary.total_material_cost * 100).toFixed(1)
                      : '0.0';
                    return (
                      <tr key={material.id} className="hover:bg-white/30 dark:hover:bg-gray-700/30 transition">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{material.name}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{material.total_quantity.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">{material.unit}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900 dark:text-white">{formatCurrency(material.total_cost)}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">{material.used_in_extra_works}</td>
                        <td className="px-4 py-3 text-sm text-right text-primary-600 dark:text-primary-400 font-medium">{percentOfTotal}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shifts Trend */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Trend směn za 6 měsíců</h3>
          <div className="space-y-3">
            {monthly_trends.map((month) => (
              <div key={month.month_key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{month.label}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{month.shifts_count} směn</span>
                </div>
                <div className="w-full h-6 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden flex items-center">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 flex items-center justify-end"
                    style={{ width: `${(month.shifts_count / maxMonthlyShifts) * 100}%` }}
                  >
                    {month.shifts_count > 0 && (
                      <span className="text-xs font-bold text-white px-2">{month.shifts_count}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Material Cost Trend */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Trend nákladů za 6 měsíců</h3>
          <div className="space-y-3">
            {monthly_trends.map((month) => (
              <div key={month.month_key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{month.label}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(month.material_cost)}
                  </span>
                </div>
                <div className="w-full h-6 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-300"
                    style={{ width: `${(month.material_cost / maxMonthlyCost) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
        >
          ← Zpět
        </button>
      </div>
    </div>
  );
};

export default ProjectOverview;
