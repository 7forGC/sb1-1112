import React from 'react';
import { 
  UserPlus, 
  MessageSquare, 
  Ban, 
  RefreshCw,
  Shield,
  Settings,
  Download,
  Bell
} from 'lucide-react';

interface QuickAction {
  label: string;
  description: string;
  icon: React.FC<any>;
  onClick: () => void;
  variant: 'primary' | 'secondary' | 'danger';
}

const actions: QuickAction[] = [
  {
    label: 'Add Admin',
    description: 'Create new admin account',
    icon: UserPlus,
    onClick: () => console.log('Add admin clicked'),
    variant: 'primary'
  },
  {
    label: 'System Backup',
    description: 'Download system backup',
    icon: Download,
    onClick: () => console.log('Backup clicked'),
    variant: 'secondary'
  },
  {
    label: 'Clear Cache',
    description: 'Clear system cache',
    icon: RefreshCw,
    onClick: () => console.log('Clear cache clicked'),
    variant: 'secondary'
  },
  {
    label: 'Security Scan',
    description: 'Run security check',
    icon: Shield,
    onClick: () => console.log('Security scan clicked'),
    variant: 'primary'
  },
  {
    label: 'Ban User',
    description: 'Ban user account',
    icon: Ban,
    onClick: () => console.log('Ban user clicked'),
    variant: 'danger'
  },
  {
    label: 'Send Notice',
    description: 'Send system notification',
    icon: Bell,
    onClick: () => console.log('Send notice clicked'),
    variant: 'primary'
  },
  {
    label: 'Message All',
    description: 'Send global message',
    icon: MessageSquare,
    onClick: () => console.log('Message all clicked'),
    variant: 'secondary'
  },
  {
    label: 'System Config',
    description: 'Modify system settings',
    icon: Settings,
    onClick: () => console.log('System config clicked'),
    variant: 'secondary'
  }
];

export const QuickActions = () => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => (
            <ActionButton key={action.label} {...action} />
          ))}
        </div>
      </div>
    </div>
  );
};

const ActionButton: React.FC<QuickAction> = ({ 
  label, 
  description, 
  icon: Icon, 
  onClick, 
  variant 
}) => {
  const variantStyles = {
    primary: 'bg-primary/10 text-primary hover:bg-primary/20',
    secondary: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    danger: 'bg-red-100 text-red-600 hover:bg-red-200'
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg transition-colors w-full text-left ${variantStyles[variant]}`}
    >
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5" />
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm opacity-80">{description}</p>
        </div>
      </div>
    </button>
  );
};