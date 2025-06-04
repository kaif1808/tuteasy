import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { getPasswordStrength } from '../../../../utils/validation';
import { clsx } from 'clsx';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

const PasswordStrengthIndicator = ({ 
  password, 
  showRequirements = true 
}: PasswordStrengthIndicatorProps) => {
  const { score, feedback, isValid } = useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-error-500';
    if (score <= 2) return 'bg-warning-500';
    if (score <= 3) return 'bg-warning-400';
    if (score <= 4) return 'bg-success-400';
    return 'bg-success-500';
  };

  const getStrengthText = (score: number) => {
    if (score <= 1) return 'Very Weak';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /\d/.test(password) },
    { label: 'One special character', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Password strength</span>
          <span className={clsx(
            'font-medium',
            score <= 2 ? 'text-error-600' : 
            score <= 3 ? 'text-warning-600' : 
            'text-success-600'
          )}>
            {getStrengthText(score)}
          </span>
        </div>
        
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={clsx(
                'h-2 flex-1 rounded-full transition-colors duration-200',
                level <= score ? getStrengthColor(score) : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-medium">Password must contain:</p>
          <div className="space-y-1">
            {requirements.map((requirement, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                {requirement.met ? (
                  <Check className="w-4 h-4 text-success-500" />
                ) : (
                  <X className="w-4 h-4 text-gray-400" />
                )}
                <span className={clsx(
                  requirement.met ? 'text-success-700' : 'text-gray-600'
                )}>
                  {requirement.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator; 