import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <AppLogoIcon
                size={36}
                className="shrink-0"
                style={{
                    filter: 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(166deg) brightness(98%) contrast(101%)',
                }}
            />
            <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-base font-bold tracking-tight text-sidebar-foreground">
                    Vimaiz
                </span>
                <span className="truncate text-[11px] font-medium text-sidebar-foreground/55">
                    Espace pro
                </span>
            </div>
        </div>
    );
}
