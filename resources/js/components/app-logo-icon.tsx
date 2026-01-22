import { ImgHTMLAttributes } from 'react';
import logoImage from '@/../assets/images/logo.png';

interface AppLogoIconProps extends ImgHTMLAttributes<HTMLImageElement> {
    size?: number;
}

export default function AppLogoIcon({ size = 40, className, ...props }: AppLogoIconProps) {
    return (
        <img 
            src={logoImage} 
            alt="VIMAIZ" 
            width={size} 
            height={size}
            className={className}
            {...props}
        />
    );
}
