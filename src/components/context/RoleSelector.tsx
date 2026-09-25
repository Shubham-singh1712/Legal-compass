import React from 'react';
import { UserRole } from '@/types/legal';
import {
  Briefcase,
  Building2,
  Home,
  KeyRound,
  Laptop,
  Users,
  Store,
  Building,
  ShoppingBag,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

interface RoleSelectorProps {
  selectedRole?: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  const roles: Array<{
    role: UserRole;
    title: string;
    description: string;
    icon: React.ElementType;
  }> = [
    {
      role: 'Employee',
      title: 'Employee',
      description: 'Understand compensation, notice periods, IP assignments & restrictive covenants.',
      icon: Briefcase,
    },
    {
      role: 'Employer',
      title: 'Employer / Company',
      description: 'Standardize company terms, confidentiality, covenants & operational expectations.',
      icon: Building2,
    },
    {
      role: 'Tenant',
      title: 'Tenant / Renter',
      description: 'Review rent, security deposits, maintenance duties, renewal windows & house rules.',
      icon: Home,
    },
    {
      role: 'Landlord',
      title: 'Landlord / Property Mgr',
      description: 'Review rental clauses, payment defaults, breach policies & tenant obligations.',
      icon: KeyRound,
    },
    {
      role: 'Freelancer',
      title: 'Freelancer / Contractor',
      description: 'Check payment milestones, scope creep, intellectual property ownership & liability.',
      icon: Laptop,
    },
    {
      role: 'Client',
      title: 'Client / Buyer',
      description: 'Validate deliverables, acceptance criteria, warranties & service level agreements.',
      icon: Users,
    },
    {
      role: 'Vendor',
      title: 'Vendor / Supplier',
      description: 'Review commercial supply terms, payment terms, indemnities & termination.',
      icon: Store,
    },
    {
      role: 'Business Owner',
      title: 'Small Business Owner',
      description: 'Evaluate B2B commercial agreements, operational contracts & risk exposure.',
      icon: Building,
    },
    {
      role: 'Consumer',
      title: 'Consumer / End-User',
      description: 'Understand subscription rules, cancellation policies, privacy & dispute resolution.',
      icon: ShoppingBag,
    },
    {
      role: 'Other',
      title: 'Neutral / General Reader',
      description: 'Objective document understanding without a specific role lens.',
      icon: HelpCircle,
    },
  ];

  return (
    <div className="w-full space-y-5">
      <div className="text-left space-y-1">
        <h3 className="text-xl font-bold text-white tracking-tight">What is your role in this document?</h3>
        <p className="text-xs sm:text-sm text-legal-300">
          This lets Legal Compass evaluate rights, obligations, and risks directly from your perspective.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[390px] overflow-y-auto pr-1">
        {roles.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedRole === item.role;

          return (
            <button
              key={item.role}
              type="button"
              onClick={() => onSelectRole(item.role)}
              className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all duration-200 ${
                isSelected
                  ? 'border-amber-400 bg-amber-500/10 shadow-subtle-glow -translate-y-0.5'
                  : 'border-legal-800/80 bg-legal-900/60 hover:bg-legal-850 hover:border-legal-700'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-amber-400 text-legal-950 font-bold shadow-sm'
                    : 'bg-legal-850 text-legal-300 border border-legal-750'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${isSelected ? 'text-amber-200' : 'text-white'}`}>
                    {item.title}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                </div>
                <p className="text-xs text-legal-400 mt-1 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
