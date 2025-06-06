'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMembersStore } from '@/lib/stores/members';
import { MONTHLY_DUES_AMOUNT } from '@/lib/utils/debt-automation';
import { ArrowLeft, Save, User } from 'lucide-react';
import Link from 'next/link';
import { urduTranslations } from '@/lib/utils/urdu-translations';

export default function AddMemberPage() {
  const router = useRouter();
  const { addMember, loading, error } = useMembersStore();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    status: 'active' as 'active' | 'inactive',
    join_date: new Date().toISOString().split('T')[0],
    monthly_dues: MONTHLY_DUES_AMOUNT, // Default to ₹200
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('براہ کرم رکن کا نام درج کریں');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addMember({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        status: formData.status,
        join_date: formData.join_date,
        monthly_dues: formData.monthly_dues,
        total_debt: 0, // Will be calculated by debt automation
      });

      alert('رکن کامیابی سے شامل کر دیا گیا! ماہانہ واجبات خودکار طور پر تیار کر دیے گئے ہیں۔');
      router.push('/members');
    } catch (err) {
      console.error('Failed to add member:', err);
      alert('رکن شامل کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container px-3 sm:px-4 lg:px-6 max-w-4xl mx-auto py-3 sm:py-4 lg:py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/members">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {urduTranslations.members.activeMember}
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 urdu-text">{urduTranslations.members.newMember}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 urdu-text">
            نظام میں نیا کمیٹی رکن شامل کریں
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="p-4">
            <div className="text-red-600 text-sm urdu-text">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 urdu-text">
            <User className="h-5 w-5" />
            رکن کی معلومات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium urdu-text">
                  مکمل نام <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="رکن کا مکمل نام درج کریں"
                  required
                  className="w-full"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium urdu-text">
                  فون نمبر
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="فون نمبر درج کریں"
                  className="w-full"
                />
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-sm font-medium urdu-text">
                  پتہ
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="رکن کا پتہ درج کریں"
                  className="w-full"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium urdu-text">
                  حالت
                </Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-islamic-green focus:border-transparent"
                >
                  <option value="active">{urduTranslations.status.active}</option>
                  <option value="inactive">{urduTranslations.status.inactive}</option>
                </select>
              </div>

              {/* Join Date */}
              <div className="space-y-2">
                <Label htmlFor="join_date" className="text-sm font-medium urdu-text">
                  شمولیت کی تاریخ
                </Label>
                <Input
                  id="join_date"
                  name="join_date"
                  type="date"
                  value={formData.join_date}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              {/* Monthly Dues */}
              <div className="space-y-2">
                <Label htmlFor="monthly_dues" className="text-sm font-medium urdu-text">
                  ماہانہ واجبات (₹)
                </Label>
                <Input
                  id="monthly_dues"
                  name="monthly_dues"
                  type="number"
                  value={formData.monthly_dues}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 urdu-text">
                  ڈیفالٹ: ہر مہینے ₹{MONTHLY_DUES_AMOUNT}۔ یہ رقم ہر مہینے خودکار طور پر ان کے واجبات میں شامل کی جائے گی۔
                </p>
              </div>
            </div>

            {/* Information Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 urdu-text">خودکار واجبات کا نظام</h4>
              <ul className="text-sm text-blue-800 space-y-1 urdu-text">
                <li>• شمولیت کی تاریخ سے موجودہ مہینے تک تاریخی ماہانہ واجبات تیار کیے جائیں گے</li>
                <li>• ہر مہینے ₹{formData.monthly_dues} کے ماہانہ واجبات خودکار طور پر شامل کیے جائیں گے</li>
                <li>• رکن کے کل واجبات خودکار طور پر حساب لگائے اور اپ ڈیٹ کیے جائیں گے</li>
                <li>• ادائیگیاں خودکار طور پر سب سے پرانے واجبات کو پہلے کم کریں گی</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting || loading}
                className="bg-islamic-green hover:bg-islamic-green/90 text-white flex-1 sm:flex-none urdu-text"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    رکن شامل کیا جا رہا ہے...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    رکن شامل کریں
                  </>
                )}
              </Button>
              
              <Link href="/members" className="flex-1 sm:flex-none">
                <Button type="button" variant="outline" className="w-full urdu-text">
                  منسوخ کریں
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
