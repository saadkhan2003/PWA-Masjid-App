'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, AlertTriangle, User, Calendar, DollarSign, FileText } from 'lucide-react';
import { useMembersStore } from '@/lib/stores/members';
import { useDebtsStore } from '@/lib/stores/debts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';

interface DebtFormData {
  member_id: string;
  amount: string;
  due_date: string;
  description: string;
  status: 'pending' | 'overdue';
}

export default function AddDebtPage() {
  const router = useRouter();
  const { members, fetchMembers, loading } = useMembersStore();
  const { addDebt } = useDebtsStore();
  
  const [formData, setFormData] = useState<DebtFormData>({
    member_id: '',
    amount: '',
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    description: '',
    status: 'pending',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMember = members.find(m => m.id === formData.member_id);

  useEffect(() => {
    if (members.length === 0) {
      fetchMembers();
    }
  }, [fetchMembers, members.length]);

  // Auto-fill amount when member is selected
  useEffect(() => {
    if (selectedMember && !formData.amount) {
      setFormData(prev => ({ 
        ...prev, 
        amount: selectedMember.monthly_dues.toString() 
      }));
    }
  }, [selectedMember, formData.amount]);

  const handleInputChange = (field: keyof DebtFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.member_id) {
      errors.member_id = 'Please select a member';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
    }

    if (!formData.due_date) {
      errors.due_date = 'Please select a due date';
    } else {
      const dueDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        setFormData(prev => ({ ...prev, status: 'overdue' }));
      } else {
        setFormData(prev => ({ ...prev, status: 'pending' }));
      }
    }

    if (!formData.description.trim()) {
      errors.description = 'Please provide a description for this debt';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create debt data object
      const debtData = {
        member_id: formData.member_id,
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        description: formData.description,
        status: formData.status,
        type: 'custom' as const, // Adding required type field
        month: new Date(formData.due_date).getMonth() + 1,
        year: new Date(formData.due_date).getFullYear(),
      };
      
      // Call the actual addDebt function from the store
      await addDebt(debtData);
      
      // Show success message
      alert(`Debt record created successfully!\n\nMember: ${selectedMember?.name}\nAmount: ${formatCurrency(parseFloat(formData.amount))}\nDue Date: ${new Date(formData.due_date).toLocaleDateString()}\nStatus: ${formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}`);
      
      router.push('/debts');
    } catch (error) {
      console.error('Failed to create debt record:', error);
      setErrors({
        submit: 'Failed to create debt record. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mobile-container mobile-optimize">
      {/* Mobile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Link href="/debts">
          <button className="mobile-button bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Debts
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="urdu-title text-gray-900">Add Debt Record</h1>
          <p className="urdu-text mt-1">Create a new debt record for a committee member</p>
        </div>
      </div>

      {/* Mobile Form Card */}
      <div className="mobile-card mobile-animate-fade-in">
        <div className="mb-6">
          <h2 className="urdu-heading flex items-center gap-2 text-[#1E8A7A]">
            <AlertTriangle className="h-5 w-5" />
            Debt Information
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Member Selection - Mobile Optimized */}
          <div className="space-y-2">
            <label htmlFor="member_id" className="urdu-text flex items-center gap-2 text-gray-900">
              <User className="h-4 w-4" />
              Select Member *
            </label>
            <select
              id="member_id"
              value={formData.member_id}
              onChange={(e) => handleInputChange('member_id', e.target.value)}
              className={`mobile-input w-full ${errors.member_id ? 'border-red-500' : ''}`}
            >
              <option value="">Choose a member...</option>
              {members
                .filter(member => member.status === 'active')
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {formatCurrency(member.monthly_dues)}/month
                  </option>
                ))}
            </select>
            {errors.member_id && (
              <p className="text-sm text-red-600 mt-1">{errors.member_id}</p>
            )}
          </div>

          {/* Member Info Display - Mobile Optimized */}
          {selectedMember && (
            <div className="mobile-card bg-[#1E8A7A]/5 border-[#1E8A7A]/20 !mb-4">
              <div className="text-sm space-y-2">
                <div className="font-semibold text-[#1E8A7A] flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Member Details:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                  <div><strong>Monthly Dues:</strong> {formatCurrency(selectedMember.monthly_dues)}</div>
                  {selectedMember.total_debt > 0 && (
                    <div className="text-red-600 font-medium">
                      <strong>Existing Debt:</strong> {formatCurrency(selectedMember.total_debt)}
                    </div>
                  )}
                  {selectedMember.phone && (
                    <div><strong>Phone:</strong> {selectedMember.phone}</div>
                  )}
                  <div><strong>Status:</strong> <span className="capitalize">{selectedMember.status}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Amount - Mobile Optimized */}
          <div className="space-y-2">
            <label htmlFor="amount" className="urdu-text flex items-center gap-2 text-gray-900">
              <DollarSign className="h-4 w-4" />
              Debt Amount (PKR) *
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="Enter debt amount"
              className={`mobile-input w-full ${errors.amount ? 'border-red-500' : ''}`}
            />
            {errors.amount && (
              <p className="text-sm text-red-600 mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Due Date - Mobile Optimized */}
          <div className="space-y-2">
            <label htmlFor="due_date" className="urdu-text flex items-center gap-2 text-gray-900">
              <Calendar className="h-4 w-4" />
              Due Date *
            </label>
            <input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => handleInputChange('due_date', e.target.value)}
              className={`mobile-input w-full ${errors.due_date ? 'border-red-500' : ''}`}
            />
            {errors.due_date && (
              <p className="text-sm text-red-600 mt-1">{errors.due_date}</p>
            )}
            {formData.due_date && (
              <p className="text-xs text-gray-600 mt-1">
                Status will be: <span className={`font-medium ${
                  new Date(formData.due_date) < new Date() ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {new Date(formData.due_date) < new Date() ? 'Overdue' : 'Pending'}
                </span>
              </p>
            )}
          </div>

          {/* Description - Mobile Optimized */}
          <div className="space-y-2">
            <label htmlFor="description" className="urdu-text flex items-center gap-2 text-gray-900">
              <FileText className="h-4 w-4" />
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the reason for this debt (e.g., 'Outstanding dues for November and December 2023')"
              rows={4}
              className={`mobile-input w-full resize-none ${errors.description ? 'border-red-500' : ''}`}
              style={{ height: 'auto', minHeight: '96px' }}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 font-medium">{errors.submit}</p>
            </div>
          )}

          {/* Mobile Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="mobile-button bg-[#1E8A7A] text-white hover:bg-[#1E8A7A]/90 disabled:opacity-50 disabled:cursor-not-allowed flex-1 order-2 sm:order-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Creating Debt Record...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Debt Record
                </>
              )}
            </button>
            <Link href="/debts" className="flex-1 order-1 sm:order-2">
              <button 
                type="button" 
                disabled={isSubmitting}
                className="mobile-button w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>

      {/* Help Text - Mobile Optimized */}
      <div className="mobile-card bg-amber-50 border-amber-200">
        <div className="text-sm text-amber-800">
          <p className="urdu-heading mb-3 flex items-center gap-2">
            💡 Debt recording tips:
          </p>
          <ul className="space-y-2 text-amber-700">
            <li className="flex items-start gap-2 urdu-text">
              <span className="flex-shrink-0 w-1 h-1 bg-amber-600 rounded-full mt-2"></span>
              <span>Select the member first to auto-fill their monthly dues amount</span>
            </li>
            <li className="flex items-start gap-2 urdu-text">
              <span className="flex-shrink-0 w-1 h-1 bg-amber-600 rounded-full mt-2"></span>
              <span>Due date determines if the debt is marked as pending or overdue</span>
            </li>
            <li className="flex items-start gap-2 urdu-text">
              <span className="flex-shrink-0 w-1 h-1 bg-amber-600 rounded-full mt-2"></span>
              <span>Provide clear descriptions to help track debt reasons</span>
            </li>
            <li className="flex items-start gap-2 urdu-text">
              <span className="flex-shrink-0 w-1 h-1 bg-amber-600 rounded-full mt-2"></span>
              <span>Debt records can be marked as paid later from the debts list</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
