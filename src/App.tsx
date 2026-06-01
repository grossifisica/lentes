import React, { useState } from 'react';
import { ArrowRightLeft, Info, Layout, Zap, Sparkles, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ImageFormation from './components/ImageFormation';
import OpticalBehavior from './components/OpticalBehavior';
import NotableRays from './components/NotableRays';
import LensTypes from './components/LensTypes';

type Tab = 'formation' | 'behavior' | 'notable' | 'types';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('types');

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <ArrowRightLeft size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Lentes Esféricas - Prof. Grossi</h1>
          </div>
        </div>
        
        {/* Tab Switcher */}
        <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('types')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'types' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers size={16} />
            Tipos de Lentes
          </button>
          <button
            onClick={() => setActiveTab('behavior')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'behavior' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Zap size={16} />
            Comportamento Óptico
          </button>
          <button
            onClick={() => setActiveTab('notable')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'notable' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles size={16} />
            Raios Notáveis
          </button>
          <button
            onClick={() => setActiveTab('formation')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'formation' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layout size={16} />
            Formação da Imagem
          </button>
        </nav>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="md:hidden p-4 bg-white border-b border-slate-200">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('types')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'types' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Montar Lente
          </button>
          <button
            onClick={() => setActiveTab('behavior')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'behavior' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Refração
          </button>
          <button
            onClick={() => setActiveTab('notable')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'notable' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Raios
          </button>
          <button
            onClick={() => setActiveTab('formation')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'formation' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Imagem
          </button>
        </div>
      </div>

      <main className="p-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'types' && <LensTypes />}
            {activeTab === 'behavior' && <OpticalBehavior />}
            {activeTab === 'notable' && <NotableRays />}
            {activeTab === 'formation' && <ImageFormation />}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}

