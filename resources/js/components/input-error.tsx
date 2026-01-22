import { cn } from '@/lib/utils';
import { type HTMLAttributes } from 'react';

export default function InputError({
    message,
    className = '',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    if (!message) return null;

    // Check if message contains HTML (like links)
    const containsHtml = /<[a-z][\s\S]*>/i.test(message);

    return (
        <p
            {...props}
            className={cn('text-sm text-red-600 dark:text-red-400', className)}
            {...(containsHtml ? { dangerouslySetInnerHTML: { __html: message } } : { children: message })}
        />
    );
}
