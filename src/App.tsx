import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { MusicCommands } from './pages/MusicCommands';
import { SecurityCommands } from './pages/SecurityCommands';
import { EconomyCommands } from './pages/EconomyCommands';
import { ModerationCommands } from './pages/ModerationCommands';
import { UtilityCommands } from './pages/UtilityCommands';
import { SocialCommands } from './pages/SocialCommands';
import { GameCommands } from './pages/GameCommands';
import { MemeCommands } from './pages/MemeCommands';
import { AnimeCommands } from './pages/AnimeCommands';
import { LevelingCommands } from './pages/LevelingCommands';
import { AICommands } from './pages/AICommands';
import { TicketCommands } from './pages/TicketCommands';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <div className="flex-1 flex flex-col min-h-screen">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            
            <main className="flex-1 p-6 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/music" element={<MusicCommands />} />
                <Route path="/security" element={<SecurityCommands />} />
                <Route path="/economy" element={<EconomyCommands />} />
                <Route path="/moderation" element={<ModerationCommands />} />
                <Route path="/utility" element={<UtilityCommands />} />
                <Route path="/social" element={<SocialCommands />} />
                <Route path="/games" element={<GameCommands />} />
                <Route path="/memes" element={<MemeCommands />} />
                <Route path="/anime" element={<AnimeCommands />} />
                <Route path="/leveling" element={<LevelingCommands />} />
                <Route path="/ai" element={<AICommands />} />
                <Route path="/tickets" element={<TicketCommands />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;