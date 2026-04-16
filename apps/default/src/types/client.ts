export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  dealValue: number;
  lastContact: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ClientNode {
  id: string;
  fieldValues: {
    '/text': string;
    '/attributes/@cli01'?: string; // Company
    '/attributes/@cli02'?: string; // Email
    '/attributes/@cli03'?: string; // Phone
    '/attributes/@cli04'?: string; // Status
    '/attributes/@cli05'?: number; // Deal Value
    '/attributes/@cli06'?: string; // Last Contact
    '/attributes/@cli07'?: string; // Priority
  };
  parentId: string | null;
}

export interface StatusCluster {
  status: Client['status'];
  label: string;
  color: string;
  clients: Client[];
  x: number;
  y: number;
}

export const STATUS_CONFIG = {
  lead: { label: 'Lead', color: '#A78BFA', lightColor: '#E9D5FF' },
  qualified: { label: 'Qualified', color: '#60A5FA', lightColor: '#DBEAFE' },
  proposal: { label: 'Proposal', color: '#34D399', lightColor: '#D1FAE5' },
  negotiation: { label: 'Negotiation', color: '#FBBF24', lightColor: '#FEF3C7' },
  'closed-won': { label: 'Closed Won', color: '#10B981', lightColor: '#D1FAE5' },
  'closed-lost': { label: 'Closed Lost', color: '#EF4444', lightColor: '#FEE2E2' }
} as const;

export const PRIORITY_CONFIG = {
  low: { color: '#94A3B8' },
  medium: { color: '#60A5FA' },
  high: { color: '#F59E0B' },
  urgent: { color: '#EF4444' }
} as const;
