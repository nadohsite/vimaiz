import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toastVariants,
} from '@/components/ui/Toast';
import { useToast } from '@/hooks/use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const variantConfig = variant ? toastVariants[variant] : toastVariants.default;
        const Icon = variantConfig.icon;

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-3">
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${variantConfig.iconColor}`} />
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
