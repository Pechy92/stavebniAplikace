import React, { useState } from 'react';
import UsersManagement from '../components/admin/UsersManagement';
import ProjectsManagement from '../components/admin/ProjectsManagement';
import MaterialsManagement from '../components/admin/MaterialsManagement';

type Tab = 'users' | 'projects' | 'materials';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  const tabs = [
    { id: 'users' as Tab, name: 'Uživatelé', icon: '👤' },
    { id: 'projects' as Tab, name: 'Projekty', icon: '🏗️' },
    { id: 'materials' as Tab, name: 'Materiály', icon: '📦' }
  ];

  return (
    <div>
      <div className="mb-6 animate-slide-up">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Administrace
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Správa uživatelů, projektů a materiálů
        </p>
      </div>

      {/* Tabs */}
      <div className="glass-card mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <nav className="flex space-x-1 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all
                ${activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
                }
              `}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        {activeTab === 'users' && <UsersManagement />}
        {activeTab === 'projects' && <ProjectsManagement />}
        {activeTab === 'materials' && <MaterialsManagement />}
      </div>
    </div>
  );
};

export default Admin;
