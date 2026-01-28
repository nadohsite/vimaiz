import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, ThumbsUp, User } from 'lucide-react';

interface Review {
    id: number;
    rating: number;
    comment: string | null;
    status: string;
    created_at: string;
    client: {
        id: number;
        name: string;
    };
    booking?: {
        address?: {
            city: string;
            address_line1: string;
        };
    };
}

interface PaginatedReviews {
    data: Review[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Stats {
    total_reviews: number;
    approved_reviews: number;
    average_rating: number;
    rating_distribution: Record<number, number>;
}

interface Props {
    reviews: PaginatedReviews;
    stats: Stats;
}

const breadcrumbs = [
    { title: 'Dashboard', href: route('agent.dashboard') },
    { title: 'Mes avis', href: route('agent.reviews.index') },
];

export default function ReviewsIndex({ reviews, stats }: Props) {
    const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
        const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${sizeClass} ${
                            star <= rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 dark:text-slate-600'
                        }`}
                    />
                ))}
            </div>
        );
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { label: string; color: string }> = {
            approved: { label: 'Approuvé', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
            pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
            rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
        };
        const { label, color } = config[status] || config.pending;
        return <Badge className={color}>{label}</Badge>;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const maxRatingCount = Math.max(...Object.values(stats.rating_distribution), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mes avis" />

            <div className="py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Mes avis clients
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Consultez les avis et notes laissés par vos clients
                        </p>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        {/* Average Rating */}
                        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-amber-100 text-sm font-medium">Note moyenne</p>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <p className="text-3xl font-bold">{stats.average_rating}</p>
                                            <p className="text-amber-100">/5</p>
                                        </div>
                                        <div className="mt-2">
                                            {renderStars(Math.round(stats.average_rating), 'sm')}
                                        </div>
                                    </div>
                                    <div className="bg-white/20 rounded-full p-3">
                                        <Star className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Reviews */}
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total avis</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                            {stats.total_reviews}
                                        </p>
                                    </div>
                                    <div className="bg-sky-100 dark:bg-sky-900/30 rounded-full p-3">
                                        <MessageSquare className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Approved Reviews */}
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Avis publiés</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                            {stats.approved_reviews}
                                        </p>
                                    </div>
                                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                                        <ThumbsUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rating Distribution */}
                        <Card className="dark:bg-slate-800 dark:border-slate-700">
                            <CardContent className="p-6">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-3">Répartition</p>
                                <div className="space-y-1">
                                    {[5, 4, 3, 2, 1].map((rating) => (
                                        <div key={rating} className="flex items-center gap-2 text-xs">
                                            <span className="w-3 text-slate-500">{rating}</span>
                                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-400 rounded-full transition-all"
                                                    style={{
                                                        width: `${(stats.rating_distribution[rating] / maxRatingCount) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="w-4 text-slate-400 text-right">
                                                {stats.rating_distribution[rating]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Reviews List */}
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="dark:text-white">Tous les avis</CardTitle>
                            <CardDescription className="dark:text-slate-400">
                                {reviews.total} avis au total
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {reviews.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <Star className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                                    <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
                                        Aucun avis pour le moment
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        Les avis apparaîtront ici après vos missions terminées.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.data.map((review) => (
                                        <div
                                            key={review.id}
                                            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center">
                                                        <User className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">
                                                            {review.client.name}
                                                        </p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            {formatDate(review.created_at)}
                                                            {review.booking?.address && (
                                                                <span>
                                                                    {' '}- {review.booking.address.city}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {renderStars(review.rating)}
                                                    {getStatusBadge(review.status)}
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                                    "{review.comment}"
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
