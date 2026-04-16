import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { X, Mail, Phone, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../types/client';
import { format } from 'date-fns';

export const ClientPanel: React.FC = () => {
  const { selectedClient, setSelectedClient } = useStore();

  if (!selectedClient) return null;

  const statusConfig = STATUS_CONFIG[selectedClient.status];
  const priorityConfig = PRIORITY_CONFIG[selectedClient.priority];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full md:w-[480px] backdrop-blur-2xl bg-gradient-to-br from-violet-50/95 via-pink-50/95 to-blue-50/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 border-l border-slate-200 dark:border-slate-700 shadow-2xl z-50 overflow-y-auto safe-top"
      >
        {/* Header */}
        <div className="sticky top-0 backdrop-blur-xl bg-white/90 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {selectedClient.company}
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${statusConfig.color}20`,
                    color: statusConfig.color
                  }}
                >
                  {statusConfig.label}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${priorityConfig.color}20`,
                    color: priorityConfig.color
                  }}
                >
                  {selectedClient.priority.toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedClient(null)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Deal Value */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl backdrop-blur-lg bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-200 dark:border-violet-800"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-violet-500/20">
                <DollarSign className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Deal Value</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              ${selectedClient.dealValue.toLocaleString()}
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Contact Information
            </h3>
            
            <div className="flex items-center gap-3 p-4 rounded-xl backdrop-blur-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500 dark:text-slate-400">Email</div>
                <div className="text-sm text-slate-900 dark:text-white truncate">
                  {selectedClient.email}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl backdrop-blur-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500 dark:text-slate-400">Phone</div>
                <div className="text-sm text-slate-900 dark:text-white">
                  {selectedClient.phone}
                </div>
              </div>
            </div>

            {selectedClient.lastContact && (
              <div className="flex items-center gap-3 p-4 rounded-xl backdrop-blur-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Last Contact</div>
                  <div className="text-sm text-slate-900 dark:text-white">
                    {format(new Date(selectedClient.lastContact), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Quick Actions
            </h3>
            
            <button className="w-full p-4 rounded-xl backdrop-blur-lg bg-gradient-to-r from-violet-500 to-pink-500 text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all relative overflow-hidden group">
              <span className="relative z-10">Send Email</span>
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/30 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                Demo
              </span>
            </button>
            
            <button className="w-full p-4 rounded-xl backdrop-blur-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-all relative overflow-hidden">
              <span className="relative z-10">Schedule Meeting</span>
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-violet-500/20 dark:bg-violet-500/30 text-violet-700 dark:text-violet-300 text-[10px] font-bold uppercase tracking-wider border border-violet-300 dark:border-violet-600">
                Demo
              </span>
            </button>
            
            <button className="w-full p-4 rounded-xl backdrop-blur-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-all relative overflow-hidden">
              <span className="relative z-10">Update Status</span>
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-violet-500/20 dark:bg-violet-500/30 text-violet-700 dark:text-violet-300 text-[10px] font-bold uppercase tracking-wider border border-violet-300 dark:border-violet-600">
                Demo
              </span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
