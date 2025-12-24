import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { LogoutConfirmationDialog } from '@/components/logout-confirmation-dialog';

import { type User } from '@/types';
import { Link } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import { useState } from 'react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full"
                        href={route('settings.profile.edit')}
                        as="button"
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        Mon profil
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
                onSelect={(e) => {
                    e.preventDefault();
                    setIsLogoutDialogOpen(true);
                }}
            >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
            </DropdownMenuItem>

            <LogoutConfirmationDialog 
                isOpen={isLogoutDialogOpen} 
                onClose={() => setIsLogoutDialogOpen(false)} 
                onConfirm={cleanup}
            />
        </>
    );
}
