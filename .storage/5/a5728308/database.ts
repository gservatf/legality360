export interface Client {
  cliente_id: string;
  nombre: string;
  correo: string;
  telefono: string;
  contrato_url: string;
  estado: 'activo' | 'inactivo' | 'suspendido';
  created_at: string;
}

export interface Case {
  caso_id: string;
  cliente_id: string;
  titulo: string;
  estado: 'nuevo' | 'en revisión' | 'en proceso' | 'completado' | 'pausado';
  fecha_inicio: string;
  fecha_estimada_fin?: string;
  carpeta_drive_url: string;
  analista_asignado: string;
  descripcion: string;
}

export interface BMCBlock {
  block_id: string;
  caso_id: string;
  block_name: 'Customer Segments' | 'Value Proposition' | 'Channels' | 'Customer Relationships' | 'Revenue Streams' | 'Key Resources' | 'Key Activities' | 'Key Partners' | 'Cost Structure';
  risk_level: 'green' | 'yellow' | 'red';
  risk_description: string;
  recommendation: string;
  last_updated: string;
}

export interface Task {
  task_id: string;
  caso_id: string;
  titulo: string;
  descripcion: string;
  responsable: 'cliente' | 'analista';
  estado: 'pendiente' | 'en proceso' | 'completado';
  fecha_limite: string;
  fecha_creacion: string;
  bmc_block?: string;
  prioridad: 'baja' | 'media' | 'alta';
}

export interface Document {
  document_id: string;
  caso_id: string;
  nombre: string;
  tipo: 'contrato' | 'reporte' | 'evaluacion' | 'otro';
  drive_url: string;
  fecha_subida: string;
  subido_por: 'cliente' | 'analista';
}

export interface ChatMessage {
  message_id: string;
  caso_id: string;
  sender: 'cliente' | 'analista';
  sender_name: string;
  mensaje: string;
  fecha_envio: string;
  leido: boolean;
}

export interface Report {
  report_id: string;
  caso_id: string;
  titulo: string;
  tipo: 'riesgos' | 'progreso' | 'completo';
  fecha_generacion: string;
  drive_url: string;
  estado: 'generando' | 'listo' | 'error';
}

export interface CaseProgress {
  stage: string;
  status: 'completed' | 'in_progress' | 'pending' | 'blocked';
  date_completed?: string;
  description: string;
}

export interface User {
  user_id: string;
  email: string;
  password_hash: string;
  role: 'cliente' | 'analista' | 'admin';
  cliente_id?: string;
  nombre: string;
  last_login?: string;
}