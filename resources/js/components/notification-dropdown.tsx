import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Calendar, MessageSquare, Star } from 'lucide-react';

const notifications = [
    {
        id: 1,
        title: 'Nouvelle réservation',
        description: 'Mme Sarah a réservé un nettoyage pour demain.',
        time: 'Il y a 5 min',
        icon: Calendar,
        color: 'text-blue-600 bg-blue-100',
    },
    {
        id: 2,
        title: 'Nouveau message',
        description: 'L\'agent Ahmed vous a envoyé un message.',
        time: 'Il y a 1h',
        icon: MessageSquare,
        color: 'text-green-600 bg-green-100',
    },
    {
        id: 3,
        title: 'Nouvel avis',
        description: 'Vous avez reçu une note de 5 étoiles !',
        time: 'Hier',
        icon: Star,
        color: 'text-yellow-600 bg-yellow-100',
    },
];

export function NotificationDropdown() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-md">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 flex h-2 w-2 shrink-0 rounded-full bg-red-500"></span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="font-bold">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                        <DropdownMenuItem key={notification.id} className="flex cursor-pointer items-start gap-4 p-4 focus:bg-neutral-50 dark:focus:bg-neutral-800">
                            <div className={`rounded-full p-2 ${notification.color}`}>
                                <notification.icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{notification.title}</p>
                                <p className="text-xs text-neutral-500 line-clamp-2">{notification.description}</p>
                                <p className="text-[10px] text-neutral-400">{notification.time}</p>
                            </div>
                        </DropdownMenuItem>
                    ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex justify-center p-2 text-xs font-medium text-indigo-600 hover:text-indigo-700">
                    Voir toutes les notifications
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
