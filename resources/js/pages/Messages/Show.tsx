import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, ArrowLeft, User, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useEffect, useRef } from 'react';

interface UserType {
    id: number;
    name: string;
    email?: string;
}

interface Message {
    id: number;
    sender_id: number;
    message: string;
    created_at: string;
    is_read: boolean;
    sender: UserType;
}

interface Conversation {
    id: number;
    client: UserType;
    agent: UserType | null;
    booking: any;
}

interface OtherConversation {
    id: number;
    client: UserType;
    agent: UserType | null;
    last_message: string | null;
    last_message_at: string | null;
    unread_count: number;
}

interface Props {
    conversation: Conversation;
    messages: Message[];
    otherConversations: OtherConversation[];
    currentUserId: number;
}

export default function Show({ conversation, messages, otherConversations, currentUserId }: Props) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset } = useForm({
        message: '',
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.message.trim()) return;

        post(route('messages.send', conversation.id), {
            onSuccess: () => {
                reset();
                inputRef.current?.focus();
            },
        });
    };

    const getOtherParticipant = () => {
        if (conversation.client.id === currentUserId) {
            return conversation.agent || { name: 'Support VIMAIZ', id: 0 };
        }
        return conversation.client;
    };

    const otherParticipant = getOtherParticipant();

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return "Aujourd'hui";
        if (days === 1) return 'Hier';
        return d.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
    };

    const groupMessagesByDate = () => {
        const groups: { date: string; messages: Message[] }[] = [];
        let currentDate = '';

        messages.forEach(message => {
            const messageDate = new Date(message.created_at).toDateString();
            if (messageDate !== currentDate) {
                currentDate = messageDate;
                groups.push({
                    date: formatDate(message.created_at),
                    messages: [message],
                });
            } else {
                groups[groups.length - 1].messages.push(message);
            }
        });

        return groups;
    };

    const messageGroups = groupMessagesByDate();

    return (
        <AppLayout breadcrumbs={[
            { title: 'Messages', href: route('messages.index') },
            { title: otherParticipant.name, href: '#' },
        ]}>
            <Head title={`Conversation avec ${otherParticipant.name}`} />

            <div className="py-4 h-[calc(100vh-120px)]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                        {/* Sidebar - Other conversations */}
                        <div className="hidden lg:block">
                            <Card className="h-full">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Conversations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y max-h-[60vh] overflow-y-auto">
                                        {otherConversations.map((conv) => (
                                            <Link
                                                key={conv.id}
                                                href={route('messages.show', conv.id)}
                                                className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                    <User className="h-4 w-4 text-slate-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {conv.agent?.name || conv.client.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {conv.last_message || 'Nouvelle conversation'}
                                                    </p>
                                                </div>
                                                {conv.unread_count > 0 && (
                                                    <Badge className="bg-sky-500 text-white text-xs">
                                                        {conv.unread_count}
                                                    </Badge>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main chat area */}
                        <div className="lg:col-span-3 flex flex-col h-full">
                            <Card className="flex flex-col h-full">
                                {/* Header */}
                                <CardHeader className="border-b flex-shrink-0">
                                    <div className="flex items-center gap-4">
                                        <Link
                                            href={route('messages.index')}
                                            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                        </Link>
                                        <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center">
                                            <User className="h-5 w-5 text-sky-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{otherParticipant.name}</CardTitle>
                                            {conversation.booking && (
                                                <p className="text-xs text-slate-500">
                                                    Réservation du {new Date(conversation.booking.check_in).toLocaleDateString('fr-FR')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>

                                {/* Messages */}
                                <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
                                    {messages.length === 0 ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">
                                                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                                <p className="text-slate-500">Aucun message</p>
                                                <p className="text-sm text-slate-400">Commencez la conversation !</p>
                                            </div>
                                        </div>
                                    ) : (
                                        messageGroups.map((group, groupIndex) => (
                                            <div key={groupIndex}>
                                                <div className="flex items-center justify-center mb-4">
                                                    <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                                                        {group.date}
                                                    </span>
                                                </div>
                                                <div className="space-y-3">
                                                    {group.messages.map((message) => {
                                                        const isOwn = message.sender_id === currentUserId;
                                                        return (
                                                            <div
                                                                key={message.id}
                                                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                            >
                                                                <div
                                                                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                                                        isOwn
                                                                            ? 'bg-sky-500 text-white rounded-br-md'
                                                                            : 'bg-slate-100 text-slate-900 rounded-bl-md'
                                                                    }`}
                                                                >
                                                                    <p className="text-sm whitespace-pre-wrap break-words">
                                                                        {message.message}
                                                                    </p>
                                                                    <p
                                                                        className={`text-xs mt-1 ${
                                                                            isOwn ? 'text-sky-100' : 'text-slate-400'
                                                                        }`}
                                                                    >
                                                                        {formatTime(message.created_at)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </CardContent>

                                {/* Input */}
                                <div className="border-t p-4 flex-shrink-0">
                                    <form onSubmit={handleSubmit} className="flex gap-2">
                                        <Input
                                            ref={inputRef}
                                            type="text"
                                            placeholder="Écrivez votre message..."
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            disabled={processing}
                                            className="flex-1"
                                            autoComplete="off"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={processing || !data.message.trim()}
                                            className="bg-sky-500 hover:bg-sky-600"
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
