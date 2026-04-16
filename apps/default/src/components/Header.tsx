import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, TrendingUp, Users, DollarSign, Plus } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useStore } from '../store/useStore';

export const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { clients, setIsAddClientModalOpen } = useStore();

  const totalValue = clients.reduce((sum, c) => sum + c.dealValue, 0);
  const activeDeals = clients.filter(c => 
    c.status !== 'closed-won' && c.status !== 'closed-lost'
  ).length;

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 safe-top">
      <div className="w-full px-4 md:px-6 py-3 md:py-4">
        <div className="grid grid-cols-2 md:grid-cols-3 items-center gap-2 md:gap-4">
          {/* Logo - Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 md:gap-3"
          >
            {/* Puzzle Piece Logo */}
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              {/* First puzzle piece - Violet */}
              <div className="absolute top-0 left-0 w-6 h-6 md:w-7 md:h-7 rounded-tl-xl rounded-br-lg bg-gradient-to-br from-violet-600 to-violet-500 dark:from-violet-500 dark:to-violet-400 shadow-lg shadow-violet-500/40 transform -rotate-12" />
              {/* Second puzzle piece - Pink */}
              <div className="absolute bottom-0 right-0 w-6 h-6 md:w-7 md:h-7 rounded-tr-xl rounded-bl-lg bg-gradient-to-br from-pink-600 to-pink-500 dark:from-pink-500 dark:to-pink-400 shadow-lg shadow-pink-500/40 transform rotate-12" />
              {/* Connecting glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-pink-500/20 blur-md rounded-xl" />
            </div>
            <div>
              <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-violet-700 via-purple-700 to-pink-700 dark:from-violet-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Neon CRM
              </h1>
              <p className="hidden md:block text-xs font-medium bg-gradient-to-r from-slate-700 to-slate-600 dark:from-slate-400 dark:to-slate-500 bg-clip-text text-transparent">
                Illuminate Your Pipeline
              </p>
            </div>
          </motion.div>

          {/* Stats - Center */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden md:flex items-center justify-center gap-4"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-lg bg-violet-500/20 dark:bg-violet-500/10 border-2 border-violet-400 dark:border-violet-800 shadow-sm shadow-violet-500/20">
              <Users className="w-4 h-4 text-violet-700 dark:text-violet-400" />
              <div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Total Clients</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{clients.length}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-lg bg-pink-500/20 dark:bg-pink-500/10 border-2 border-pink-400 dark:border-pink-800 shadow-sm shadow-pink-500/20">
              <TrendingUp className="w-4 h-4 text-pink-700 dark:text-pink-400" />
              <div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Active Deals</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{activeDeals}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-lg bg-blue-500/20 dark:bg-blue-500/10 border-2 border-blue-400 dark:border-blue-800 shadow-sm shadow-blue-500/20">
              <DollarSign className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Pipeline Value</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  ${(totalValue / 1000).toFixed(0)}k
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions - Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-end items-center gap-2 md:gap-3 md:col-span-1 col-span-1"
          >
            <button 
              onClick={() => setIsAddClientModalOpen(true)}
              className="px-3 md:px-4 py-2 rounded-xl backdrop-blur-lg bg-gradient-to-r from-violet-500 to-pink-500 text-white font-medium hover:shadow-lg hover:scale-105 transition-all flex items-center gap-1 md:gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Client</span>
              <span className="sm:hidden">New</span>
            </button>
            
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl backdrop-blur-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </header>
  );
};
