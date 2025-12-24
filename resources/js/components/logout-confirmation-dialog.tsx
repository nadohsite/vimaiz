import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

interface LogoutConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
}

export function LogoutConfirmationDialog({ isOpen, onClose, onConfirm }: LogoutConfirmationDialogProps) {
    const handleLogout = () => {
        if (onConfirm) onConfirm();
        router.post(route('logout'), {}, {
            onFinish: () => onClose(),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Confirmer la déconnexion</DialogTitle>
                    <DialogDescription>
                        Êtes-vous sûr de vouloir vous déconnecter de votre session ?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button variant="destructive" onClick={handleLogout}>
                        Se déconnecter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
