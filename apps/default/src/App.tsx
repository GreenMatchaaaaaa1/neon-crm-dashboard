import React, { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { Header } from './components/Header';
import { CRMGalaxy } from './components/CRMGalaxy';
import { ClientListView } from './components/ClientListView';
import { ClientPanel } from './components/ClientPanel';
import { AgentChat } from './components/AgentChat';
import { NewClientModal } from './components/NewClientModal';
import { useStore } from './store/useStore';
import { clientsApi } from './services/api';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const { setClients, setIsLoading, isLoading, isAddClientModalOpen, setIsAddClientModalOpen } = useStore();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const data = await clientsApi.getAll();
        setClients(data);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [setClients, setIsLoading]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-gradient-to-br from-violet-200 via-pink-200 to-blue-200 dark:from-slate-950 dark:via-violet-950 dark:to-slate-900 relative">
        {/* Additional gradient overlay for more depth in light mode */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-100/50 via-transparent to-cyan-100/50 dark:opacity-0 pointer-events-none" />
        <div className="relative z-10">
          <Header />
          
          <main className="relative h-[calc(100vh-73px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Loading your CRM galaxy...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop: Galaxy View */}
              <div className="hidden md:block h-full">
                <CRMGalaxy />
              </div>
              
              {/* Mobile: List View */}
              <div className="block md:hidden h-full">
                <ClientListView />
              </div>
            </>
          )}
        </main>

          <ClientPanel />
          <AgentChat />
        </div>
      </div>
      
      {/* Modal rendered at root level for proper centering */}
      <NewClientModal 
        isOpen={isAddClientModalOpen} 
        onClose={() => setIsAddClientModalOpen(false)} 
      />
    </ThemeProvider>
  );
};

export default App;
