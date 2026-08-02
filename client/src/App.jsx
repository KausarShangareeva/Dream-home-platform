import { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import DashboardTab from './components/DashboardTab.jsx';
import DreamsTab from './components/DreamsTab.jsx';
import SadaqaTab from './components/SadaqaTab.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app">
      <Sidebar activeTab={activeTab} onChangeTab={setActiveTab} />
      <main>
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'dreams' && <DreamsTab />}
        {activeTab === 'sadaqa' && <SadaqaTab />}
      </main>
    </div>
  );
}
