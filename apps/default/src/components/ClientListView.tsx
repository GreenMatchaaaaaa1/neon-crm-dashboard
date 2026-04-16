import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Client, STATUS_CONFIG } from '../types/client';
import { DollarSign, Phone, Mail, Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export const ClientListView: React.FC = () => {
  const { clients, selectedStatus, setSelectedStatus, setSelectedClient } = useStore();

  // Calculate stats
  const totalValue = clients.reduce((sum, c) => sum + c.dealValue, 0);
  const activeDeals = clients.filter(c => 
    c.status !== 'closed-won' && c.status !== 'closed-lost'
  ).length;

  // Group clients by status
  const groupedClients = Object.keys(STATUS_CONFIG).map((status) => ({
    status: status as Client['status'],
    label: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].label,
    color: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].color,
    clients: clients.filter(c => c.status === status)
  })).filter(group => group.clients.length > 0);

  const filteredClients = selectedStatus 
    ? clients.filter(c => c.status === selectedStatus)
    : clients;

  const handleStatusClick = (status: string) => {
    setSelectedStatus(selectedStatus === status ? null : status);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-6 space-y-6">
      {/* Compact Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-violet-200 dark:border-violet-800">
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Clients</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">{clients.length}</div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-pink-200 dark:border-pink-800">
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Active</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">{activeDeals}</div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-blue-200 dark:border-blue-800">
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Value</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            ${(totalValue / 1000).toFixed(0)}k
          </div>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedStatus(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            !selectedStatus
              ? "bg-violet-500 text-white shadow-lg"
              : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 backdrop-blur-sm"
          )}
        >
          All ({clients.length})
        </button>
        {groupedClients.map(group => (
          <button
            key={group.status}
            onClick={() => handleStatusClick(group.status)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              selectedStatus === group.status
                ? "text-white shadow-lg"
                : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 backdrop-blur-sm"
            )}
            style={{
              backgroundColor: selectedStatus === group.status ? group.color : undefined
            }}
          >
            {group.label} ({group.clients.length})
          </button>
        ))}
      </div>

      {/* Client Cards */}
      <div className="space-y-3">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No clients found</p>
          </div>
        ) : (
          filteredClients.map((client, index) => {
            const statusConfig = STATUS_CONFIG[client.status];
            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedClient(client)}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-slate-200/50 dark:border-slate-700/50"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-1">
                      {client.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {client.company}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: statusConfig.color }}
                  >
                    {statusConfig.label}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {client.dealValue > 0 && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <DollarSign className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatCurrency(client.dealValue)}
                      </span>
                    </div>
                  )}
                  
                  {client.email && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 col-span-2">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  
                  {client.phone && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 col-span-2">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  
                  {client.lastContact && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 col-span-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs">
                        Last contact: {format(new Date(client.lastContact), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
