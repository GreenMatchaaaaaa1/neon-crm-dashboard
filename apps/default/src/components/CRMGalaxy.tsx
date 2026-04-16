import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Client, STATUS_CONFIG, StatusCluster } from '../types/client';
import { DollarSign, Phone, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { getAvatarGradient, getInitials } from '../utils/avatar';

export const CRMGalaxy: React.FC = () => {
  const { clients, selectedStatus, setSelectedStatus, setSelectedClient } = useStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [clusters, setClusters] = useState<StatusCluster[]>([]);
  const [hoveredClient, setHoveredClient] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.offsetWidth,
          height: canvasRef.current.offsetHeight
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    // Group clients by status into clusters
    const statusGroups = Object.keys(STATUS_CONFIG).map((status) => {
      const statusClients = clients.filter(c => c.status === status);
      return {
        status: status as Client['status'],
        label: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].label,
        color: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].color,
        clients: statusClients,
        x: 0,
        y: 0
      };
    });

    // Position clusters in a circular layout - more compact and central
    const centerX = 42; // Shifted left
    const centerY = 45; // Shifted up
    const radius = 20; // Reduced for tighter clustering
    
    statusGroups.forEach((cluster, index) => {
      const angle = (index / statusGroups.length) * 2 * Math.PI - Math.PI / 2;
      cluster.x = centerX + radius * Math.cos(angle);
      cluster.y = centerY + radius * Math.sin(angle);
    });

    setClusters(statusGroups);
  }, [clients]);

  const handleClusterClick = (status: string) => {
    if (selectedStatus === status) {
      setSelectedStatus(null);
    } else {
      setSelectedStatus(status);
    }
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
  };

  const getClusterSize = (clientCount: number) => {
    const baseSize = 80; // Smaller base size
    const scaleFactor = Math.min(clientCount * 8, 40); // Reduced scaling
    return baseSize + scaleFactor;
  };

  const getClientPosition = (clusterIndex: number, clientIndex: number, totalClients: number) => {
    const cluster = clusters[clusterIndex];
    if (!cluster) return { x: 50, y: 50 };

    // Large orbit radius for maximum spacing and perfect circle
    const orbitRadius = 20; // Increased for better distribution
    
    // Perfect clock distribution starting at 12 o'clock
    // Distribute evenly around the circle
    const angleStep = (2 * Math.PI) / totalClients;
    const angle = (clientIndex * angleStep) - (Math.PI / 2); // Start at top (12 o'clock)

    // Calculate exact position on the circle
    const x = cluster.x + (orbitRadius * Math.cos(angle));
    const y = cluster.y + (orbitRadius * Math.sin(angle));

    return { x, y };
  };

  return (
    <div className="relative w-full h-full overflow-visible bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50 dark:from-slate-950 dark:via-violet-950 dark:to-slate-900">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]" />
      
      <div ref={canvasRef} className="relative w-full h-full overflow-visible">
        {/* Status Clusters */}
        <AnimatePresence>
          {clusters.map((cluster, clusterIndex) => {
            const clusterSize = getClusterSize(cluster.clients.length);
            const isExpanded = selectedStatus === cluster.status;
            const hasClients = cluster.clients.length > 0;

            return (
              <React.Fragment key={cluster.status}>
                {/* Cluster Node */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: selectedStatus && selectedStatus !== cluster.status ? 0.15 : 1,
                    filter: selectedStatus && selectedStatus !== cluster.status ? 'blur(8px)' : 'blur(0px)',
                  }}
                  transition={{ delay: clusterIndex * 0.1, type: 'spring', stiffness: 200 }}
                  style={{
                    position: 'absolute',
                    left: `${cluster.x}%`,
                    top: `${cluster.y}%`,
                    width: clusterSize,
                    height: clusterSize,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isExpanded ? 20 : 10,
                  }}
                  className="cursor-pointer group"
                  onClick={() => hasClients && handleClusterClick(cluster.status)}
                >
                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full blur-2xl opacity-40"
                    style={{ backgroundColor: cluster.color }}
                    animate={{
                      scale: isExpanded ? 1.3 : 1,
                      opacity: isExpanded ? 0.6 : 0.4
                    }}
                  />



                  {/* Main cluster bubble - claymorphism */}
                  <motion.div
                    className="relative w-full h-full rounded-full backdrop-blur-xl border-2 shadow-2xl flex flex-col items-center justify-center"
                    style={{
                      backgroundColor: `${cluster.color}15`,
                      borderColor: `${cluster.color}40`,
                      boxShadow: `0 8px 32px ${cluster.color}30, inset 0 1px 0 rgba(255,255,255,0.3)`
                    }}
                    animate={{
                      scale: isExpanded ? 0.6 : 1, // Shrink more when expanded
                      y: [0, -5, 0]
                    }}
                    transition={{
                      y: {
                        repeat: Infinity,
                        duration: 3,
                        delay: clusterIndex * 0.3,
                        ease: 'easeInOut'
                      }
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-center px-2">
                      <div 
                        className="text-xl font-bold mb-0.5"
                        style={{ color: cluster.color }}
                      >
                        {cluster.clients.length}
                      </div>
                      <div className="text-[10px] font-medium text-slate-700 dark:text-slate-300">
                        {cluster.label}
                      </div>
                      {cluster.clients.length > 0 && (
                        <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
                          ${(cluster.clients.reduce((sum, c) => sum + c.dealValue, 0) / 1000).toFixed(0)}k
                        </div>
                      )}
                    </div>

                    {/* Pulse ring on hover */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 opacity-0 group-hover:opacity-100"
                      style={{ borderColor: cluster.color }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0, 0.5, 0]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2
                      }}
                    />
                  </motion.div>
                </motion.div>

                {/* Client Nodes (when cluster is expanded) - Circular Orbit */}
                <AnimatePresence>
                  {isExpanded && cluster.clients.map((client, clientIndex) => {
                    const pos = getClientPosition(clusterIndex, clientIndex, cluster.clients.length);
                    const isHovered = hoveredClient === client.id;

                    return (
                      <motion.div
                        key={client.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ delay: clientIndex * 0.05 }}
                        style={{
                          position: 'absolute',
                          left: pos.x + '%',
                          top: pos.y + '%',
                          transform: 'translate(-50%, -50%)',
                          zIndex: isHovered ? 999998 : 30, // Boost z-index when hovered
                        }}
                        className="cursor-pointer group/client"
                        onClick={() => handleClientClick(client)}
                        onMouseEnter={() => setHoveredClient(client.id)}
                        onMouseLeave={() => setHoveredClient(null)}
                      >
                          {/* Client card with profile */}
                          <motion.div
                            className="relative backdrop-blur-xl border shadow-xl rounded-xl overflow-hidden w-full"
                            style={{
                              backgroundColor: cluster.color + '10',
                              borderColor: cluster.color + '40',
                              boxShadow: '0 8px 24px ' + cluster.color + '20, inset 0 1px 0 rgba(255,255,255,0.2)'
                            }}
                            whileHover={{ scale: 1.05, y: -4 }}
                            animate={{
                              y: [0, -3, 0]
                            }}
                            transition={{
                              y: {
                                repeat: Infinity,
                                duration: 2,
                                delay: clientIndex * 0.2,
                                ease: 'easeInOut'
                              }
                            }}
                          >
                            {/* Profile picture */}
                            <div className="p-3 pb-1">
                              <div 
                                className="w-11 h-11 rounded-full mx-auto flex items-center justify-center text-white font-bold text-sm shadow-lg"
                                style={{
                                  background: getAvatarGradient(client.company),
                                  boxShadow: '0 4px 12px ' + cluster.color + '40'
                                }}
                              >
                                {getInitials(client.company)}
                              </div>
                            </div>

                            {/* Client info */}
                            <div className="px-3 pb-2 text-center">
                              <div 
                                className="text-xs font-bold mb-0.5"
                                style={{ color: cluster.color }}
                                title={client.company}
                              >
                                {client.company}
                              </div>
                              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-600 dark:text-slate-400">
                                <DollarSign className="w-3 h-3" />
                                <span className="font-medium">
                                  ${(client.dealValue / 1000).toFixed(0)}k
                                </span>
                              </div>
                            </div>

                            {/* Priority indicator */}
                            <div 
                              className="absolute top-2 right-2 w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: client.priority === 'urgent' ? '#EF4444' : 
                                               client.priority === 'high' ? '#F59E0B' : 
                                               client.priority === 'medium' ? '#60A5FA' : '#94A3B8',
                                boxShadow: '0 0 8px ' + (client.priority === 'urgent' ? '#EF4444' : 
                                           client.priority === 'high' ? '#F59E0B' : 
                                           client.priority === 'medium' ? '#60A5FA' : '#94A3B8') + '80'
                              }}
                            />
                          </motion.div>

                          {/* Expanded hover tooltip */}
                          <AnimatePresence>
                            {isHovered && (() => {
                              // Smart 4-corner positioning based on card location
                              // More generous thresholds to prevent edge clipping
                              const isNearTop = pos.y < 30;
                              const isNearBottom = pos.y > 70;
                              const isNearLeft = pos.x < 30;
                              const isNearRight = pos.x > 70;
                              
                              // Determine best position
                              let positionStyle: React.CSSProperties = {
                                zIndex: 999999, // Even higher z-index to ensure it's always on top
                                borderColor: cluster.color + '60',
                                boxShadow: '0 20px 60px ' + cluster.color + '40'
                              };
                              
                              // Vertical positioning - ALWAYS prefer top unless very close to top edge
                              if (isNearTop) {
                                // Near top edge - show below the card
                                positionStyle.top = 'calc(100% + 1rem)';
                                positionStyle.bottom = 'auto';
                              } else {
                                // Default - show above the card (diagonal top)
                                positionStyle.bottom = 'calc(100% + 1rem)';
                                positionStyle.top = 'auto';
                              }
                              
                              // Horizontal positioning - prefer right unless near right edge
                              if (isNearRight) {
                                // Near right edge - show to the left
                                positionStyle.right = 'calc(100% + 1rem)';
                                positionStyle.left = 'auto';
                              } else {
                                // Default - show to the right (diagonal right)
                                positionStyle.left = 'calc(100% + 1rem)';
                                positionStyle.right = 'auto';
                              }
                              
                              return (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                  className="absolute w-72 p-5 rounded-2xl backdrop-blur-2xl bg-white/98 dark:bg-slate-900/98 border shadow-2xl pointer-events-none z-[999999]"
                                  style={positionStyle}
                                >
                                <div className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                                  {client.company}
                                </div>
                                <div className="space-y-2 text-xs">
                                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-500/20">
                                      <DollarSign className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <span className="font-medium">${client.dealValue.toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-500/20">
                                      <Mail className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="truncate">{client.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-500/20">
                                      <Phone className="w-3 h-3 text-green-600 dark:text-green-400" />
                                    </div>
                                    <span>{client.phone}</span>
                                  </div>
                                  {client.lastContact && (
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                      <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                                        <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                      </div>
                                      <span>{format(new Date(client.lastContact), 'MMM d')}</span>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                              );
                            })()}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                </AnimatePresence>
              </React.Fragment>
            );
          })}
        </AnimatePresence>

        {/* Instructions overlay */}
        {!selectedStatus && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-6 right-6 px-8 py-4 rounded-2xl backdrop-blur-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 shadow-2xl z-50"
          >
            <div className="text-center">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                Welcome to your CRM Galaxy
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Click any status bubble to explore clients • Hover for details
              </p>
            </div>
          </motion.div>
        )}

        {/* Selected status info */}
        {selectedStatus && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-6 right-6 px-6 py-3 rounded-2xl backdrop-blur-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 shadow-xl z-50"
          >
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Showing <span className="font-bold text-slate-900 dark:text-white">
                {STATUS_CONFIG[selectedStatus as keyof typeof STATUS_CONFIG]?.label}
              </span> clients • Click bubble again to collapse
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
