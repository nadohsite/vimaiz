import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <AppLogoIcon 
            size={40} 
            style={{ filter: 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(166deg) brightness(98%) contrast(101%)' }}
        />
    );
}
