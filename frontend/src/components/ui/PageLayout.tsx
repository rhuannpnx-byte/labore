import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  headerAction?: ReactNode;
}

export function PageLayout({
  children,
  title,
  subtitle,
  showBackButton = false,
  backTo,
  headerAction,
}: PageLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeft size={16} />}
              onClick={handleBack}
              className="mt-1"
            />
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {headerAction && (
          <div className="flex-shrink-0">
            {headerAction}
          </div>
        )}
      </div>

      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
}


