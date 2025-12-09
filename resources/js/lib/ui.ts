// Export centralisé de tous les composants UI VIMAIZ

// Design System
export * from './design-system';

// Composants UI de base (Shadcn existants)
export { Button } from '@/components/ui/button';
export { Badge } from '@/components/ui/badge';
export { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
export { Input } from '@/components/ui/input';
export { Label } from '@/components/ui/label';
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
export { Checkbox } from '@/components/ui/checkbox';
export { Skeleton } from '@/components/ui/skeleton';
export { Separator } from '@/components/ui/separator';
export { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Composants UI personnalisés VIMAIZ
export { Rating, RatingDisplay } from '@/components/ui/Rating';
export { EmptyState } from '@/components/ui/EmptyState';
export { LoadingSpinner, LoadingOverlay } from '@/components/ui/LoadingSpinner';
export { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription, ToastClose, ToastAction } from '@/components/ui/Toast';
export { Toaster } from '@/components/ui/Toaster';

// Hooks
export { useToast, toast } from '@/hooks/use-toast';

// Types
export type { BookingStatus } from './design-system';
export type { ToastVariant, ToastType } from '@/hooks/use-toast';
