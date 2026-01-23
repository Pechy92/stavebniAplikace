import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Shift {
  id: number;
  project_id: number;
  project_name: string;
  user_id: number;
  user_name: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  created_at: string;
}

const ShiftsList: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    projectId: '',
    userId: ''
  });

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/shifts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShifts(response.data);
    } catch (error) {
      console.error('Chyba při načítání směn:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const filteredShifts = shifts.filter(shift => {
    if (filters.dateFrom && shift.date < filters.dateFrom) return false;
    if (filters.dateTo && shift.date > filters.dateTo) return false;
    if (filters.projectId && shift.project_id !== parseInt(filters.projectId)) return false;
    if (filters.userId && shift.user_id !== parseInt(filters.userId)) return false;
    return true;
  });

  // Seskupit směny podle týdnů
  const groupByWeek = (shifts: Shift[]) => {
    const weeks: { [key: string]: Shift[] } = {};
    shifts.forEach(shift => {
      const date = new Date(shift.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay() + 1); // Pondělí
      const weekKey = weekStart.toISOString().split('T')[0];
      if (!weeks[weekKey]) weeks[weekKey] = [];
      weeks[weekKey].push(shift);
    });
    return weeks;
  };

  const weeklyShifts = groupByWeek(filteredShifts);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Načítám směny...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Směny</h1>
          <p className="mt-1 text-sm text-gray-500">
            Celkem {filteredShifts.length} {filteredShifts.length === 1 ? 'směna' : filteredShifts.length < 5 ? 'směny' : 'směn'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/shifts/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nová směna
          </Link>
        </div>
      </div>

      {/* Filtry */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
              Datum od
            </label>
            <input
              type="date"
              id="dateFrom"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
              Datum do
            </label>
            <input
              type="date"
              id="dateTo"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <button
              onClick={() => setFilters({ dateFrom: '', dateTo: '', projectId: '', userId: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Vymazat filtry
            </button>
          </div>
        </div>
      </div>

      {/* Seznam směn seskupených po týdnech */}
      <div className="space-y-6">
        {Object.keys(weeklyShifts).length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Žádné směny</h3>
            <p className="mt-1 text-sm text-gray-500">Začněte vytvořením nové směny.</p>
            <div className="mt-6">
              <Link
                to="/shifts/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Nová směna
              </Link>
            </div>
          </div>
        ) : (
          Object.keys(weeklyShifts).sort().reverse().map(weekKey => {
            const weekShifts = weeklyShifts[weekKey];
            const totalHours = weekShifts.reduce((sum, shift) => sum + shift.duration_hours, 0);
            const weekStart = new Date(weekKey);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            return (
              <div key={weekKey} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Týden {formatDate(weekStart.toISOString())} - {formatDate(weekEnd.toISOString())}
                    </h3>
                    <span className="text-sm text-gray-500">
                      Celkem: <span className="font-medium text-gray-900">{totalHours.toFixed(1)} hodin</span>
                    </span>
                  </div>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pracovník</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projekt</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Čas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hodin</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {weekShifts.map((shift) => (
                      <tr key={shift.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(shift.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {shift.user_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {shift.project_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {shift.duration_hours.toFixed(1)}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ShiftsList;
