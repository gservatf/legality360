import { Client, Case, BMCBlock, Task, Document, ChatMessage, Report, User, CaseProgress, ClientCollaborator, TaskEditData } from '@/types/database';

// Mock database using localStorage for persistence
class MockDatabase {
  private getStorageKey(table: string): string {
    return `legality360_${table}`;
  }

  private getData<T>(table: string): T[] {
    const data = localStorage.getItem(this.getStorageKey(table));
    return data ? JSON.parse(data) : [];
  }

  private setData<T>(table: string, data: T[]): void {
    localStorage.setItem(this.getStorageKey(table), JSON.stringify(data));
  }

  // Initialize with seed data
  initializeDatabase(): void {
    // Only initialize if data doesn't exist
    if (!localStorage.getItem(this.getStorageKey('clients'))) {
      this.seedDatabase();
    }
  }

  private seedDatabase(): void {
    // Seed Users
    const users: User[] = [
      {
        id: 'user_001',
        email: 'contacto@inandinas.com',
        password_hash: 'demo123', // In real app, this would be hashed
        role: 'cliente',
        cliente_id: '001',
        nombre: 'Inversiones Andinas S.A.C.',
      },
      {
        id: 'user_002',
        email: 'analista@legality360.com',
        password_hash: 'analyst123',
        role: 'analista',
        nombre: 'María González',
      }
    ];
    this.setData('users', users);

    // Seed Clients
    const clients: Client[] = [
      {
        id: '001',
        nombre: 'Inversiones Andinas S.A.C.',
        correo: 'contacto@inandinas.com',
        telefono: '+51 987654321',
        contrato_url: 'https://drive.google.com/file/d/CONTRATO-DEMO',
        estado: 'activo',
        created_at: '2025-09-01T00:00:00Z'
      }
    ];
    this.setData('clients', clients);

    // Seed Client Collaborators
    const collaborators: ClientCollaborator[] = [
      {
        id: 'collab_001',
        client_id: '001',
        nombre: 'Carlos Mendoza',
        correo: 'carlos.mendoza@inandinas.com',
        rol: 'colaborador',
        created_at: '2025-09-01T00:00:00Z'
      },
      {
        id: 'collab_002',
        client_id: '001',
        nombre: 'Ana Torres',
        correo: 'ana.torres@inandinas.com',
        rol: 'administrador_cliente',
        created_at: '2025-09-01T00:00:00Z'
      }
    ];
    this.setData('collaborators', collaborators);

    // Seed Cases
    const cases: Case[] = [
      {
        id: '101',
        cliente_id: '001',
        titulo: 'Implementación Legal 360° – Expansión comercial',
        estado: 'en revisión',
        fecha_inicio: '2025-09-01',
        fecha_estimada_fin: '2025-12-01',
        carpeta_drive_url: 'https://drive.google.com/drive/folders/CARPETA-DEMO',
        analista_asignado: 'María González',
        descripcion: 'Análisis integral de riesgos legales para expansión comercial de Inversiones Andinas S.A.C.'
      }
    ];
    this.setData('cases', cases);

    // Seed BMC Blocks
    const bmcBlocks: BMCBlock[] = [
      {
        id: 'bmc_001',
        caso_id: '101',
        block_name: 'Value Proposition',
        risk_level: 'yellow',
        risk_description: 'Marca no registrada en INDECOPI',
        recommendation: 'Iniciar trámite de registro de marca ante INDECOPI',
        last_updated: '2025-09-28T10:00:00Z'
      },
      {
        id: 'bmc_002',
        caso_id: '101',
        block_name: 'Revenue Streams',
        risk_level: 'red',
        risk_description: 'Facturación sin comprobantes electrónicos',
        recommendation: 'Regularizar sistema de facturación electrónica con SUNAT',
        last_updated: '2025-09-28T10:00:00Z'
      },
      {
        id: 'bmc_003',
        caso_id: '101',
        block_name: 'Key Partners',
        risk_level: 'green',
        risk_description: 'Contratos vigentes y claros',
        recommendation: 'Mantener revisión anual de contratos',
        last_updated: '2025-09-28T10:00:00Z'
      },
      {
        id: 'bmc_004',
        caso_id: '101',
        block_name: 'Customer Segments',
        risk_level: 'green',
        risk_description: 'Segmentación clara y documentada',
        recommendation: 'Continuar monitoreo de mercado objetivo',
        last_updated: '2025-09-28T10:00:00Z'
      },
      {
        id: 'bmc_005',
        caso_id: '101',
        block_name: 'Channels',
        risk_level: 'yellow',
        risk_description: 'Canales digitales sin términos de uso',
        recommendation: 'Implementar términos y condiciones en plataformas digitales',
        last_updated: '2025-09-28T10:00:00Z'
      },
      {
        id: 'bmc_006',
        caso_id: '101',
        block_name: 'Customer Relationships',
        risk_level: 'green',
        risk_description: 'Políticas de atención al cliente establecidas',
        recommendation: 'Mantener estándares actuales',
        last_updated: '2025-09-28T10:00:00Z'
      },
      {
        id: 'bmc_007',
        caso_id: '101',
        block_name: 'Key Resources',
        risk_level: 'yellow',
        risk_description: 'Algunos activos sin registro formal',
        recommendation: 'Formalizar registro de activos principales',
        last_updated: '2025-09-28T10:00:00Z'
      },
      {
        id: 'bmc_008',
        caso_id: '101',
        block_name: 'Key Activities',
        risk_level: 'green',
        risk_description: 'Actividades principales bien definidas',
        recommendation: 'Continuar con procesos actuales',
        last_updated: '2025-09-28T10:00:00Z'
      },
      {
        id: 'bmc_009',
        caso_id: '101',
        block_name: 'Cost Structure',
        risk_level: 'yellow',
        risk_description: 'Algunos costos no están optimizados fiscalmente',
        recommendation: 'Revisar estructura de costos para optimización tributaria',
        last_updated: '2025-09-28T10:00:00Z'
      }
    ];
    this.setData('bmcBlocks', bmcBlocks);

    // Seed Tasks with new structure
    const tasks: Task[] = [
      {
        id: 'task_001',
        caso_id: '101',
        titulo: 'Subir contrato de proveedor de software',
        descripcion: 'Cargar el contrato firmado con el proveedor de software en la carpeta de Drive',
        responsable: '001',
        responsable_tipo: 'cliente',
        responsable_nombre: 'Inversiones Andinas S.A.C.',
        estado: 'pendiente',
        fecha_limite: '2025-10-05',
        fecha_creacion: '2025-09-28',
        bmc_block: 'Key Partners',
        prioridad: 'alta',
        created_by: 'analista'
      },
      {
        id: 'task_002',
        caso_id: '101',
        titulo: 'Elaborar informe de riesgos laborales',
        descripcion: 'Preparar análisis detallado de riesgos en materia laboral',
        responsable: 'user_002',
        responsable_tipo: 'analista',
        responsable_nombre: 'María González',
        estado: 'en proceso',
        fecha_limite: '2025-10-10',
        fecha_creacion: '2025-09-25',
        bmc_block: 'Key Activities',
        prioridad: 'media',
        created_by: 'analista'
      },
      {
        id: 'task_003',
        caso_id: '101',
        titulo: 'Registrar marca en INDECOPI',
        descripcion: 'Iniciar trámite de registro de marca comercial',
        responsable: 'user_002',
        responsable_tipo: 'analista',
        responsable_nombre: 'María González',
        estado: 'pendiente',
        fecha_limite: '2025-11-15',
        fecha_creacion: '2025-09-28',
        bmc_block: 'Value Proposition',
        prioridad: 'alta',
        created_by: 'analista'
      },
      {
        id: 'task_004',
        caso_id: '101',
        titulo: 'Revisar contratos con proveedores',
        descripcion: 'Validar términos y condiciones de contratos existentes',
        responsable: 'collab_001',
        responsable_tipo: 'colaborador',
        responsable_nombre: 'Carlos Mendoza',
        estado: 'pendiente',
        fecha_limite: '2025-10-15',
        fecha_creacion: '2025-09-28',
        bmc_block: 'Key Partners',
        prioridad: 'media',
        created_by: 'cliente'
      }
    ];
    this.setData('tasks', tasks);

    // Seed Documents
    const documents: Document[] = [
      {
        id: 'doc_001',
        caso_id: '101',
        nombre: 'Contrato de Servicios Legal 360°',
        tipo: 'contrato',
        drive_url: 'https://drive.google.com/file/d/CONTRATO-DEMO',
        fecha_subida: '2025-09-01',
        subido_por: 'analista'
      },
      {
        id: 'doc_002',
        caso_id: '101',
        nombre: 'Evaluación Inicial de Riesgos',
        tipo: 'evaluacion',
        drive_url: 'https://drive.google.com/file/d/EVALUACION-DEMO',
        fecha_subida: '2025-09-15',
        subido_por: 'analista'
      }
    ];
    this.setData('documents', documents);

    // Seed Chat Messages
    const chatMessages: ChatMessage[] = [
      {
        id: 'msg_001',
        caso_id: '101',
        sender: 'analista',
        sender_name: 'María González',
        mensaje: 'Por favor, suba el contrato de proveedor de software antes del 5 de octubre.',
        fecha_envio: '2025-09-28T09:30:00Z',
        leido: false
      },
      {
        id: 'msg_002',
        caso_id: '101',
        sender: 'cliente',
        sender_name: 'Inversiones Andinas S.A.C.',
        mensaje: 'Entendido, estaremos subiendo el documento esta semana.',
        fecha_envio: '2025-09-28T14:15:00Z',
        leido: true
      }
    ];
    this.setData('chatMessages', chatMessages);

    // Seed Reports
    const reports: Report[] = [
      {
        id: 'rep_001',
        caso_id: '101',
        titulo: 'LG-01-CORP-28-SEPTIEMBRE-2025.pdf',
        tipo: 'completo',
        fecha_generacion: '2025-09-28',
        drive_url: 'https://drive.google.com/file/d/REPORTE-DEMO',
        estado: 'listo'
      }
    ];
    this.setData('reports', reports);
  }

  // CRUD operations
  getClients(): Client[] {
    return this.getData<Client>('clients');
  }

  getClientById(clientId: string): Client | undefined {
    return this.getClients().find(c => c.id === clientId);
  }

  getCollaborators(): ClientCollaborator[] {
    return this.getData<ClientCollaborator>('collaborators');
  }

  getCollaboratorsByClientId(clientId: string): ClientCollaborator[] {
    return this.getCollaborators().filter(c => c.client_id === clientId);
  }

  getCases(): Case[] {
    return this.getData<Case>('cases');
  }

  getCasesByClientId(clientId: string): Case[] {
    return this.getCases().filter(c => c.cliente_id === clientId);
  }

  getBMCBlocks(): BMCBlock[] {
    return this.getData<BMCBlock>('bmcBlocks');
  }

  getBMCBlocksByCaseId(caseId: string): BMCBlock[] {
    return this.getBMCBlocks().filter(b => b.caso_id === caseId);
  }

  getTasks(): Task[] {
    return this.getData<Task>('tasks');
  }

  getTasksByCaseId(caseId: string): Task[] {
    return this.getTasks().filter(t => t.caso_id === caseId);
  }

  getTaskById(taskId: string): Task | undefined {
    return this.getTasks().find(t => t.id === taskId);
  }

  getDocuments(): Document[] {
    return this.getData<Document>('documents');
  }

  getDocumentsByCaseId(caseId: string): Document[] {
    return this.getDocuments().filter(d => d.caso_id === caseId);
  }

  getChatMessages(): ChatMessage[] {
    return this.getData<ChatMessage>('chatMessages');
  }

  getChatMessagesByCaseId(caseId: string): ChatMessage[] {
    return this.getChatMessages().filter(m => m.caso_id === caseId);
  }

  getReports(): Report[] {
    return this.getData<Report>('reports');
  }

  getReportsByCaseId(caseId: string): Report[] {
    return this.getReports().filter(r => r.caso_id === caseId);
  }

  getUsers(): User[] {
    return this.getData<User>('users');
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email === email);
  }

  // Add new message to chat
  addChatMessage(message: Omit<ChatMessage, 'id'>): void {
    const messages = this.getChatMessages();
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}`
    };
    messages.push(newMessage);
    this.setData('chatMessages', messages);
  }

  // Update task status
  updateTaskStatus(taskId: string, status: Task['estado']): void {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex].estado = status;
      this.setData('tasks', tasks);
    }
  }

  // Update full task
  updateTask(taskId: string, taskData: TaskEditData): void {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        titulo: taskData.titulo,
        descripcion: taskData.descripcion,
        responsable: taskData.responsable,
        responsable_tipo: taskData.responsable_tipo,
        responsable_nombre: taskData.responsable_nombre,
        bmc_block: taskData.bmc_block,
        estado: taskData.estado,
        prioridad: taskData.prioridad,
        fecha_limite: taskData.fecha_limite
      };
      this.setData('tasks', tasks);
    }
  }

  // Add new collaborator
  addCollaborator(collaborator: Omit<ClientCollaborator, 'id' | 'created_at'>): void {
    const collaborators = this.getCollaborators();
    const newCollaborator: ClientCollaborator = {
      ...collaborator,
      id: `collab_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    collaborators.push(newCollaborator);
    this.setData('collaborators', collaborators);
  }

  // Get BMC block names for dropdown
  getBMCBlockNames(): string[] {
    return [
      'Customer Segments',
      'Value Proposition', 
      'Channels',
      'Customer Relationships',
      'Revenue Streams',
      'Key Resources',
      'Key Activities',
      'Key Partners',
      'Cost Structure'
    ];
  }
}

export const mockDB = new MockDatabase();