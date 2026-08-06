import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Booking {
    id: number;
    check_in: string;
    check_out: string;
}

interface Conversation {
    id: number;
    client: User;
    agent: User | null;
    booking: Booking | null;
    last_message: string | null;
    last_message_at: string | null;
    unread_count: number;
}

interface Props {
    conversations: {
        data: Conversation[];
        links: any;
    };
}

export default function Index({ conversations }: Props) {
    const formatDate = (date: string | null) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Hier';
        } else if (days < 7) {
            return d.toLocaleDateString('fr-FR', { weekday: 'long' });
        }
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Messages', href: route('messages.index') }]}>
            <Head title="Messages" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
                            <p className="text-slate-500 mt-1">Vos conversations</p>
                        </div>
                    </div>

                    {conversations.data.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">Aucune conversation</h3>
                                <p className="text-slate-500">
                                    Vos conversations avec les clients et intervenants apparaîtront ici.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-sky-500" />
                                    Conversations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {conversations.data.map((conversation) => (
                                        <Link
                                            key={conversation.id}
                                            href={route('messages.show', conversation.id)}
                                            className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                                                <User className="h-6 w-6 text-sky-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="font-medium text-slate-900 truncate">
                                                        {conversation.agent?.name || conversation.client.name}
                                                    </p>
                                                    <span className="text-xs text-slate-500 flex-shrink-0">
                                                        {formatDate(conversation.last_message_at)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 truncate mt-1">
                                                    {conversation.last_message || 'Nouvelle conversation'}
                                                </p>
                                            </div>
                                            {conversation.unread_count > 0 && (
                                                <Badge className="bg-sky-500 text-white">
                                                    {conversation.unread_count}
                                                </Badge>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
