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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Administrace</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Správa uživatelů, projektů a materiálů
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'users' && <UsersManagement />}
        {activeTab === 'projects' && <ProjectsManagement />}
        {activeTab === 'materials' && <MaterialsManagement />}
      </div>
    </div>
  );
};

export default Admin;
