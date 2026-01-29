import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Send, Paperclip, Image as ImageIcon, X } from 'lucide-react';
import { getAvatarUrl } from '@/lib/utils';

interface Message {
    id: number;
    sender_id: number;
    sender_name: string;
    sender_avatar?: string;
    message: string;
    created_at: string;
    is_mine: boolean;
}

interface Props {
    booking_id: number;
    other_user: {
        id: number;
        name: string;
        avatar?: string;
    };
    messages: Message[];
}

export default function Chat({ booking_id, other_user, messages: initialMessages }: Props) {
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || sending) return;

        setSending(true);

        try {
            // In a real app, this would be an API call
            const tempMessage: Message = {
                id: Date.now(),
                sender_id: 1, // Current user ID
                sender_name: 'You',
                message: newMessage,
                created_at: new Date().toISOString(),
                is_mine: true,
            };

            setMessages([...messages, tempMessage]);
            setNewMessage('');

            // Here you would send to backend
            // await axios.post(route('chat.send'), { booking_id, message: newMessage });
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-neutral-50">
            <Head title={`Chat with ${other_user.name}`} />

            {/* Header */}
            <div className="bg-white border-b border-neutral-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={route('bookings.show', booking_id)} className="text-neutral-600 hover:text-neutral-900">
                            <X className="w-5 h-5" />
                        </Link>
                        <img
                            src={getAvatarUrl(other_user.avatar, other_user.name)}
                            alt={other_user.name}
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <div className="font-bold text-neutral-900">{other_user.name}</div>
                            <div className="text-xs text-neutral-500">Online</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex gap-3 max-w-[70%] ${message.is_mine ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!message.is_mine && (
                                <img
                                    src={getAvatarUrl(message.sender_avatar, message.sender_name)}
                                    alt={message.sender_name}
                                    className="w-8 h-8 rounded-full flex-shrink-0"
                                />
                            )}
                            <div>
                                <div
                                    className={`px-4 py-3 rounded-2xl ${message.is_mine
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white border border-neutral-200 text-neutral-900'
                                        }`}
                                >
                                    <p className="text-sm">{message.message}</p>
                                </div>
                                <div className={`text-xs text-neutral-500 mt-1 ${message.is_mine ? 'text-right' : 'text-left'}`}>
                                    {new Date(message.created_at).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {messages.length === 0 && (
                    <div className="text-center py-12 text-neutral-500">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="bg-white border-t border-neutral-200 p-4">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <button
                        type="button"
                        className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                    >
                        <Send className="w-5 h-5" />
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
