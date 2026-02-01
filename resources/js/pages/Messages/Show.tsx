import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, ArrowLeft, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

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

export default function Show({ conversation, messages: initialMessages, otherConversations, currentUserId }: Props) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isConnected, setIsConnected] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        message: '',
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Update messages when props change
    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Real-time message listener
    useEffect(() => {
        if (!window.Echo || !conversation.id) return;

        console.log('[Echo] Connecting to conversation.' + conversation.id);
        
        const channel = window.Echo.private(`conversation.${conversation.id}`);
        
        channel
            .subscribed(() => {
                console.log('[Echo] Subscribed to conversation.' + conversation.id);
                setIsConnected(true);
            })
            .listen('.new-message', (event: any) => {
                console.log('[Echo] New message received:', event);
                // Add the new message to the list if it's not from current user
                if (event.sender_id !== currentUserId) {
                    setMessages(prev => {
                        // Check if message already exists
                        if (prev.some(m => m.id === event.id)) return prev;
                        return [...prev, {
                            id: event.id,
                            sender_id: event.sender_id,
                            message: event.message,
                            created_at: event.created_at,
                            is_read: false,
                            sender: { id: event.sender_id, name: event.sender_name }
                        }];
                    });
                }
            })
            .error((error: any) => {
                console.error('[Echo] Error:', error);
                setIsConnected(false);
            });

        return () => {
            console.log('[Echo] Leaving conversation.' + conversation.id);
            channel.stopListening('.new-message');
            window.Echo.leave(`conversation.${conversation.id}`);
            setIsConnected(false);
        };
    }, [conversation.id, currentUserId]);

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

            <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 min-h-0 w-full py-4">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                        {/* Sidebar - Other conversations */}
                        <div className="hidden lg:block">
                            <Card className="h-full flex flex-col">
                                <div className="p-4 border-b flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-slate-500" />
                                        <span className="text-sm font-medium">Conversations</span>
                                        {isConnected && (
                                            <span className="ml-auto w-2 h-2 bg-green-500 rounded-full" title="Connecté" />
                                        )}
                                    </div>
                                </div>
                                <CardContent className="p-0 flex-1 overflow-y-auto">
                                    <div className="divide-y">
                                        {otherConversations.map((conv) => {
                                            // Determine the other participant based on current user
                                            const otherPerson = conv.client.id === currentUserId 
                                                ? conv.agent 
                                                : conv.client;
                                            const isActive = conv.id === conversation.id;
                                            
                                            return (
                                                <Link
                                                    key={conv.id}
                                                    href={route('messages.show', conv.id)}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 transition-colors",
                                                        isActive ? "bg-sky-50 border-l-2 border-sky-500" : "hover:bg-slate-50"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                                                        isActive ? "bg-sky-100" : "bg-slate-100"
                                                    )}>
                                                        <User className={cn(
                                                            "h-5 w-5",
                                                            isActive ? "text-sky-600" : "text-slate-500"
                                                        )} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn(
                                                            "text-sm truncate",
                                                            isActive ? "font-semibold text-sky-900" : "font-medium"
                                                        )}>
                                                            {otherPerson?.name || 'Support VIMAIZ'}
                                                        </p>
                                                        <p className="text-xs text-slate-500 truncate">
                                                            {conv.last_message || 'Nouvelle conversation'}
                                                        </p>
                                                    </div>
                                                    {conv.unread_count > 0 && (
                                                        <Badge className="bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                                                            {conv.unread_count}
                                                        </Badge>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                        {otherConversations.length === 0 && (
                                            <div className="p-4 text-center text-sm text-slate-400">
                                                Aucune conversation
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main chat area */}
                        <div className="lg:col-span-3 flex flex-col h-full min-h-0">
                            <Card className="flex flex-col h-full overflow-hidden min-h-0">
                                {/* Sticky Header */}
                                <div className="border-b flex-shrink-0 bg-white z-10 sticky top-0 p-4">
                                    <div className="flex items-center gap-4">
                                        <Link
                                            href={route('messages.index')}
                                            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                        </Link>
                                        <div className="h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center">
                                            <User className="h-6 w-6 text-sky-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-base font-semibold text-slate-900">{otherParticipant.name}</h2>
                                            <div className="flex items-center gap-2">
                                                {isConnected ? (
                                                    <span className="flex items-center gap-1 text-xs text-green-600">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                        En ligne
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Hors ligne</span>
                                                )}
                                                {conversation.booking && (
                                                    <span className="text-xs text-slate-400">
                                                        • Réservation du {new Date(conversation.booking.check_in).toLocaleDateString('fr-FR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
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
                                </div>

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
