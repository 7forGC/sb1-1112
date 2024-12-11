export type AdminActionType = 
  | 'BACKUP'
  | 'CLEAR_CACHE'
  | 'BAN_USER'
  | 'SEND_NOTICE'
  | 'UPDATE_CONFIG';

export interface AdminAction {
  type: AdminActionType;
  payload?: unknown;
  timestamp: Date;
  performedBy: string;
  status: 'pending' | 'success' | 'failure';
  details?: string;
}

export interface ActionButtonProps {
  label: string;
  description: string;
  icon: React.FC<any>;
  onClick: () => void;
  variant: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}