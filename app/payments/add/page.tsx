'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, CreditCard, User, Calendar, DollarSign, FileText } from 'lucide-react';
import { useMembersStore } from '@/lib/stores/members';
import { usePaymentsStore } from '@/lib/stores/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/currency';
import { urduTranslations } from '@/lib/utils/urdu-translations';
import Link from 'next/link';

interface PaymentFormData {
  member_id: string;
  amount: string;
  payment_date: string;
  month: string;
  year: string;
  notes: string;
  receipt_number: string;
}

export default function AddPaymentPage() {
  const router = useRouter();
  const { members, fetchMembers, loading } = useMembersStore();
  const { addPayment } = usePaymentsStore();
  
  const [formData, setFormData] = useState<PaymentFormData>({
    member_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
    notes: '',
    receipt_number: '',
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

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
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

    if (!formData.payment_date) {
      errors.payment_date = 'Please select a payment date';
    }

    if (!formData.month || parseInt(formData.month) < 1 || parseInt(formData.month) > 12) {
      errors.month = 'Please select a valid month';
    }

    if (!formData.year || parseInt(formData.year) < 2020) {
      errors.year = 'Please enter a valid year';
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
      // Create payment data object
      const paymentData = {
        member_id: formData.member_id,
        amount: parseFloat(formData.amount),
        payment_date: formData.payment_date,
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        notes: formData.notes || undefined,
        receipt_number: formData.receipt_number || undefined,
      };
      
      // Call the actual addPayment function from the store
      await addPayment(paymentData);
      
      // Redirect to payments page on success
      router.push('/payments');
    } catch (error) {
      console.error('Failed to record payment:', error);
      setErrors({
        submit: 'Failed to record payment. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const months = [
    { value: '1', label: urduTranslations.months.january },
    { value: '2', label: urduTranslations.months.february },
    { value: '3', label: urduTranslations.months.march },
    { value: '4', label: urduTranslations.months.april },
    { value: '5', label: urduTranslations.months.may },
    { value: '6', label: urduTranslations.months.june },
    { value: '7', label: urduTranslations.months.july },
    { value: '8', label: urduTranslations.months.august },
    { value: '9', label: urduTranslations.months.september },
    { value: '10', label: urduTranslations.months.october },
    { value: '11', label: urduTranslations.months.november },
    { value: '12', label: urduTranslations.months.december },
  ];

  return (
    <div className="mobile-container mobile-optimize">
      {/* Mobile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Link href="/payments">
          <button className="mobile-button bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {urduTranslations.navigation.payments} میں واپس
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="urdu-title text-gray-900">{urduTranslations.payments.recordPayment}</h1>
          <p className="urdu-text mt-1">کمیٹی کے رکن کے لیے ادائیگی کا ریکارڈ شامل کریں</p>
        </div>
      </div>

      {/* Mobile Form Card */}
      <div className="mobile-card mobile-animate-fade-in">
        <div className="mb-6">
          <h2 className="urdu-heading flex items-center gap-2 text-[#1E8A7A]">
            <CreditCard className="h-5 w-5" />
            ادائیگی کی معلومات
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Member Selection - Mobile Optimized */}
          <div className="space-y-2">
            <label htmlFor="member_id" className="urdu-text flex items-center gap-2 text-gray-900">
              <User className="h-4 w-4" />
              {urduTranslations.common.member} منتخب کریں *
            </label>
            <select
              id="member_id"
              value={formData.member_id}
              onChange={(e) => handleInputChange('member_id', e.target.value)}
              className={`mobile-input w-full rtl-select ${errors.member_id ? 'border-red-500' : ''}`}
            >
              <option value="">رکن منتخب کریں...</option>
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
                  رکن کی تفصیلات:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                  <div><strong>ماہانہ واجب:</strong> {formatCurrency(selectedMember.monthly_dues)}</div>
                  {selectedMember.total_debt > 0 && (
                    <div className="text-red-600 font-medium">
                      <strong>باقی واجبات:</strong> {formatCurrency(selectedMember.total_debt)}
                    </div>
                  )}
                  {selectedMember.phone && (
                    <div><strong>فون:</strong> {selectedMember.phone}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Amount - Mobile Optimized */}
          <div className="space-y-2">
            <label htmlFor="amount" className="urdu-text flex items-center gap-2 text-gray-900">
              <DollarSign className="h-4 w-4" />
              ادائیگی کی رقم (PKR) *
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="ادائیگی کی رقم درج کریں"
              className={`mobile-input w-full ${errors.amount ? 'border-red-500' : ''}`}
            />
            {errors.amount && (
              <p className="text-sm text-red-600 mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Payment Date - Mobile Optimized */}
          <div className="space-y-2">
            <label htmlFor="payment_date" className="urdu-text flex items-center gap-2 text-gray-900">
              <Calendar className="h-4 w-4" />
              ادائیگی کی تاریخ *
            </label>
            <input
              id="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={(e) => handleInputChange('payment_date', e.target.value)}
              className={`mobile-input w-full ${errors.payment_date ? 'border-red-500' : ''}`}
            />
            {errors.payment_date && (
              <p className="text-sm text-red-600 mt-1">{errors.payment_date}</p>
            )}
          </div>

          {/* Month and Year - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="month" className="urdu-text text-gray-900">
                کس مہینے کی ادائیگی *
              </label>
              <select
                id="month"
                value={formData.month}
                onChange={(e) => handleInputChange('month', e.target.value)}
                className={`mobile-input w-full rtl-select ${errors.month ? 'border-red-500' : ''}`}
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              {errors.month && (
                <p className="text-sm text-red-600 mt-1">{errors.month}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="year" className="urdu-text text-gray-900">
                سال *
              </label>
              <input
                id="year"
                type="number"
                min="2020"
                max="2030"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                className={`mobile-input w-full ${errors.year ? 'border-red-500' : ''}`}
              />
              {errors.year && (
                <p className="text-sm text-red-600 mt-1">{errors.year}</p>
              )}
            </div>
          </div>

          {/* Receipt Number - Mobile Optimized */}
          <div className="space-y-2">
            <label htmlFor="receipt_number" className="urdu-text flex items-center gap-2 text-gray-900">
              <FileText className="h-4 w-4" />
              Receipt Number (Optional)
            </label>
            <input
              id="receipt_number"
              type="text"
              value={formData.receipt_number}
              onChange={(e) => handleInputChange('receipt_number', e.target.value)}
              placeholder="e.g., RCP-001"
              className="mobile-input w-full"
            />
          </div>

          {/* Notes - Mobile Optimized */}
          <div className="space-y-2">
            <label htmlFor="notes" className="urdu-text text-gray-900">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add payment notes or comments..."
              rows={3}
              className="mobile-input w-full resize-none"
              style={{ height: 'auto', minHeight: '72px' }}
            />
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
                  Recording Payment...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Record Payment
                </>
              )}
            </button>
            <Link href="/payments" className="flex-1 order-1 sm:order-2">
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
      <div className="mobile-card bg-blue-50 border-blue-200">
        <div className="text-sm text-blue-800">
          <p className="urdu-heading mb-3 flex items-center gap-2">
            💡 Payment recording tips:
          </p>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start gap-2 urdu-text">
              <span className="flex-shrink-0 w-1 h-1 bg-blue-600 rounded-full mt-2"></span>
              <span>Select the member first to auto-fill their monthly dues amount</span>
            </li>
            <li className="flex items-start gap-2 urdu-text">
              <span className="flex-shrink-0 w-1 h-1 bg-blue-600 rounded-full mt-2"></span>
              <span>Payment date is when the payment was actually received</span>
            </li>
            <li className="flex items-start gap-2 urdu-text">
              <span className="flex-shrink-0 w-1 h-1 bg-blue-600 rounded-full mt-2"></span>
              <span>Month/Year indicates which dues period this payment covers</span>
            </li>
            <li className="flex items-start gap-2 urdu-text">
              <span className="flex-shrink-0 w-1 h-1 bg-blue-600 rounded-full mt-2"></span>
              <span>Receipt numbers help track physical receipts</span>
            </li>
            <li className="flex items-start gap-2 urdu-text">
              <span className="flex-shrink-0 w-1 h-1 bg-blue-600 rounded-full mt-2"></span>
              <span>Partial payments are allowed and will be tracked</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
