import { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import logoImage from '@/../assets/images/logo.png';

interface AppLogoIconProps extends ImgHTMLAttributes<HTMLImageElement> {
    /** Logo height in pixels — width scales to keep aspect ratio */
    size?: number;
}

export default function AppLogoIcon({ size = 40, className, style, ...props }: AppLogoIconProps) {
    return (
        <img
            src={logoImage}
            alt="VIMAIZ"
            className={cn('max-w-full object-contain', className)}
            style={{ height: size, width: 'auto', ...style }}
            {...props}
        />
    );
}
