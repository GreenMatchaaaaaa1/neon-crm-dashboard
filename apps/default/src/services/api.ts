import axios from 'axios';
import { Client, ClientNode } from '../types/client';

const api = axios.create({
  baseURL: '/api/taskade'
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('🌐 API Request:', request.method?.toUpperCase(), request.url);
  console.log('   Full URL:', request.baseURL + request.url);
  return request;
});

export const clientsApi = {
  async getAll(): Promise<Client[]> {
    const response = await api.get<{ ok: boolean; payload: { nodes: ClientNode[] } }>(
      '/projects/njKwcoKERpcosf5Z/nodes'
    );
    
    return response.data.payload.nodes.map(node => ({
      id: node.id,
      name: node.fieldValues['/text'] || '',
      company: node.fieldValues['/attributes/@cli01'] || '',
      email: node.fieldValues['/attributes/@cli02'] || '',
      phone: node.fieldValues['/attributes/@cli03'] || '',
      status: (node.fieldValues['/attributes/@cli04'] as Client['status']) || 'lead',
      dealValue: node.fieldValues['/attributes/@cli05'] || 0,
      lastContact: node.fieldValues['/attributes/@cli06'] || '',
      priority: (node.fieldValues['/attributes/@cli07'] as Client['priority']) || 'medium'
    }));
  },

  async create(client: Partial<Client>): Promise<void> {
    await api.post('/projects/njKwcoKERpcosf5Z/nodes', {
      '/text': client.name,
      '/attributes/@cli01': client.company,
      '/attributes/@cli02': client.email,
      '/attributes/@cli03': client.phone,
      '/attributes/@cli04': client.status || 'lead',
      '/attributes/@cli05': client.dealValue || 0,
      '/attributes/@cli06': client.lastContact,
      '/attributes/@cli07': client.priority || 'medium'
    });
  },

  async update(id: string, client: Partial<Client>): Promise<void> {
    await api.patch(`/projects/njKwcoKERpcosf5Z/nodes/${id}`, {
      '/text': client.name,
      '/attributes/@cli01': client.company,
      '/attributes/@cli02': client.email,
      '/attributes/@cli03': client.phone,
      '/attributes/@cli04': client.status,
      '/attributes/@cli05': client.dealValue,
      '/attributes/@cli06': client.lastContact,
      '/attributes/@cli07': client.priority
    });
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/projects/njKwcoKERpcosf5Z/nodes/${id}`);
  }
};

export const agentApi = {
  async createConversation(): Promise<string> {
    const response = await api.post<{ ok: boolean; conversationId: string }>(
      '/agents/01KMMP47FP6R75PX6R5VTG6SHE/public-conversations'
    );
    return response.data.conversationId;
  },

  async sendMessage(convoId: string, text: string): Promise<void> {
    await api.post(
      `/agents/01KMMP47FP6R75PX6R5VTG6SHE/public-conversations/${convoId}/messages`,
      { text }
    );
  },

  getStreamUrl(convoId: string): string {
    return `/api/taskade/agents/01KMMP47FP6R75PX6R5VTG6SHE/public-conversations/${convoId}/stream`;
  }
};


