import { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import DashboardTab from './components/DashboardTab.jsx';
import DreamsTab from './components/DreamsTab.jsx';
import TravelTab from './components/TravelTab.jsx';
import DebtsTab from './components/DebtsTab.jsx';
import SadaqaTab from './components/SadaqaTab.jsx';
import PersonalPanel from './components/PersonalPanel.jsx';
import HadithTab from './components/HadithTab.jsx';
import TipsTab from './components/TipsTab.jsx';
import mamaPhoto from './assets/mama.jpg';
import kausarPhoto from './assets/kausar.jpg';
import kayumPhoto from './assets/kayum.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    try { return localStorage.getItem('activeTab') || 'dashboard'; }
    catch { return 'dashboard'; }
  });

  const changeTab = (tab) => {
    setActiveTab(tab);
    try { localStorage.setItem('activeTab', tab); } catch { /* ignore (private mode etc.) */ }
  };

  return (
    <div className="app">
      <Sidebar activeTab={activeTab} onChangeTab={changeTab} />
      <main className="main">
        <Topbar />
        <div className="tab-panel active">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'dreams' && <DreamsTab />}
          {activeTab === 'travel' && <TravelTab />}
          {activeTab === 'debts' && <DebtsTab />}
          {activeTab === 'sadaqa' && <SadaqaTab />}
          {activeTab === 'hadith' && <HadithTab />}
          {activeTab === 'tips' && <TipsTab />}
          {activeTab === 'personal:mama' && <PersonalPanel ownerId="mama" title="Личные цели мамы" photo={mamaPhoto} />}
          {activeTab === 'personal:kausar' && <PersonalPanel ownerId="kausar" title="Личные цели — Каусар" photo={kausarPhoto} />}
          {activeTab === 'personal:kayum' && <PersonalPanel ownerId="kayum" title="Личные цели — Каюм" photo={kayumPhoto} />}
        </div>
      </main>
    </div>
  );
}
