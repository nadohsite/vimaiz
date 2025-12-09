import React from 'react';
import { Star } from 'lucide-react';

export interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  onChange?: (value: number) => void;
  showValue?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  size = 'md',
  readonly = true,
  onChange,
  showValue = false,
  className = '',
}) => {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => i + 1).map((rating) => {
          const isFilled = rating <= displayValue;
          const isPartial = rating === Math.ceil(displayValue) && displayValue % 1 !== 0;

          return (
            <button
              key={rating}
              type="button"
              disabled={readonly}
              onClick={() => handleClick(rating)}
              onMouseEnter={() => !readonly && setHoverValue(rating)}
              onMouseLeave={() => !readonly && setHoverValue(null)}
              className={`transition-all ${
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
              }`}
              aria-label={`${rating} étoile${rating > 1 ? 's' : ''}`}
            >
              <Star
                className={`${sizeClasses[size]} transition-colors ${
                  isFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-none text-neutral-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-neutral-700 ml-1">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

// Composant pour afficher uniquement la note (readonly)
export const RatingDisplay: React.FC<{
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  count?: number;
  className?: string;
}> = ({ value, max = 5, size = 'sm', count, className }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <Rating value={value} max={max} size={size} readonly showValue />
      {count !== undefined && (
        <span className="text-sm text-neutral-500">({count})</span>
      )}
    </div>
  );
};
