import {
    AlertCircle,
    AlertTriangle,
    Ban,
    Bell,
    CheckCircle,
    CreditCard,
    FileText,
    Home,
    MessageSquare,
    Play,
    RefreshCw,
    Shield,
    ShieldAlert,
    User,
    Wallet,
    type LucideIcon,
} from 'lucide-react';

export interface NotificationIconConfig {
    icon: LucideIcon;
    color: string;
}

const notificationIcons: Record<string, NotificationIconConfig> = {
    new_quote: { icon: FileText, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' },
    quote_accepted: { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' },
    quote_refused: { icon: AlertCircle, color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' },
    payment_received: { icon: CreditCard, color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
    mission_assigned: { icon: User, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' },
    agent_accepted: { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' },
    agent_accepted_mission: { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' },
    agent_refused_mission: { icon: AlertCircle, color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' },
    mission_started: { icon: Play, color: 'text-sky-600 bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400' },
    mission_completed: { icon: CheckCircle, color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
    agent_payout: { icon: Wallet, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' },
    new_message: { icon: MessageSquare, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400' },
    new_cleaning_request: { icon: Home, color: 'text-sky-600 bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400' },
    new_service_request: { icon: Home, color: 'text-sky-600 bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400' },
    withdrawal_request: { icon: Wallet, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' },
    return_requested: { icon: AlertTriangle, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400' },
    return_completed: { icon: RefreshCw, color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
    documents_verified: { icon: Shield, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' },
    documents_rejected: { icon: ShieldAlert, color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' },
    agent_warning: { icon: AlertTriangle, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' },
    agent_suspended: { icon: Ban, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400' },
    agent_banned: { icon: Ban, color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' },
};

const defaultIcon: NotificationIconConfig = {
    icon: Bell,
    color: 'text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400',
};

export function getNotificationIcon(type: string): NotificationIconConfig {
    return notificationIcons[type] ?? defaultIcon;
}
