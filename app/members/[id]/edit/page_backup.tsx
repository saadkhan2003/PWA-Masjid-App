// Generate static params for all possible member IDs
export async function generateStaticParams() {
  // Return empty array to handle dynamic generation at build time
  return [];
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign,
  CreditCard,
  AlertTriangle,
  History,
  User,
  Trash2
} from 'lucide-react';
import { useMembersStore } from '@/lib/stores/members';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { urduTranslations, islamicPhrases } from '@/lib/utils/urdu-translations';
import Link from 'next/link';

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { members, fetchMembers, deleteMember, loading } = useMembersStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const memberId = params.id as string;
  const member = members.find(m => m.id === memberId);

  useEffect(() => {
    if (members.length === 0) {
      fetchMembers();
    }
  }, [fetchMembers, members.length]);

  const handleDelete = async () => {
    if (!member) return;
    
    setIsDeleting(true);
    try {
      await deleteMember(member.id);
      router.push('/members');
    } catch (error) {
      console.error('Failed to delete member:', error);
      alert('رکن حذف کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading && !member) {
    return (
      <div className="mobile-container">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-islamic-green"></div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="mobile-container">
        <Card className="mobile-card mobile-optimize">
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="mobile-subheading text-gray-900 mb-2 urdu-text">رکن نہیں ملا</h3>
            <p className="mobile-body text-gray-500 mb-4 urdu-text">
              جس رکن کو آپ تلاش کر رہے ہیں وہ موجود نہیں ہے یا ہٹا دیا گیا ہے۔
            </p>
            <Link href="/members">
              <Button variant="outline" className="mobile-button urdu-text">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ارکان پر واپس جائیں
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mobile-container space-y-6 mobile-scroll">
      {/* Header */}
      <div className="mobile-animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/members">
              <Button variant="outline" className="mobile-button urdu-text">
                <ArrowLeft className="h-4 w-4 mr-2" />
                واپس
              </Button>
            </Link>
            <div>
              <h1 className="mobile-heading text-gray-900">{member.name}</h1>
              <p className="mobile-body text-gray-600 urdu-text">رکن کی تفصیلات</p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href={`/members/${member.id}/edit`} className="flex-1 sm:flex-none">
              <Button variant="outline" className="mobile-button w-full urdu-text">
                <Edit className="h-4 w-4 mr-2" />
                {urduTranslations.actions.edit}
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="mobile-button text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 flex-1 sm:flex-none urdu-text"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {urduTranslations.common.delete}
            </Button>
          </div>
        </div>
      </div>

      {/* Member Information */}
      <div className="mobile-cards-grid gap-6">
        {/* Basic Information */}
        <Card className="mobile-card mobile-optimize">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 urdu-text">
              <User className="h-5 w-5 text-islamic-green" />
              بنیادی معلومات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 urdu-text">حالت</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                } urdu-text`}
              >
                {member.status === 'active' ? urduTranslations.status.active : urduTranslations.status.inactive}
              </span>
            </div>
            
            {member.phone && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-2 urdu-text">
                  <Phone className="h-4 w-4" />
                  {urduTranslations.common.phone}
                </span>
                <span className="font-medium">{member.phone}</span>
              </div>
            )}
            
            {member.address && (
              <div className="flex items-start justify-between">
                <span className="text-gray-600 flex items-center gap-2 urdu-text">
                  <MapPin className="h-4 w-4" />
                  پتہ
                </span>
                <span className="font-medium text-right max-w-[200px]">{member.address}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2 urdu-text">
                <Calendar className="h-4 w-4" />
                {urduTranslations.members.joinDate}
              </span>
              <span className="font-medium">{formatDate(member.join_date)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 urdu-text">شمولیت کی تاریخ</span>
              <span className="font-medium">{formatDate(member.created_at)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 urdu-text">
              <DollarSign className="h-5 w-5 text-islamic-green" />
              مالی معلومات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 urdu-text">{urduTranslations.members.monthlyContribution}</span>
              <span className="font-medium text-lg">{formatCurrency(member.monthly_dues)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 urdu-text">{urduTranslations.debts.totalDues}</span>
              <span className={`font-medium text-lg ${
                member.total_debt > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(member.total_debt)}
              </span>
            </div>
            
            <div className="pt-3 border-t">
              <div className="text-sm text-gray-500 mb-2 urdu-text">واجبات کی حالت</div>
              {member.total_debt > 0 ? (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm urdu-text">باقی واجبات موجود ہیں</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <span className="text-sm urdu-text">✓ کوئی باقی واجبات نہیں</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions
      <Card className="mobile-card mobile-optimize">
        <CardHeader>
          <CardTitle className="urdu-heading">{urduTranslations.dashboard.quickStats}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mobile-cards-responsive">
            <Link href={`/payments/add?member=${member.id}`}>
              <Button variant="outline" className="mobile-button justify-start w-full urdu-text">
                <CreditCard className="h-4 w-4 mr-2" />
                {urduTranslations.payments.recordPayment}
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="mobile-button justify-start urdu-text"
              onClick={() => {
                // TODO: Implement payment history modal or navigate to filtered payments
                window.location.href = `/payments?member=${member.id}`;
              }}
            >
              <History className="h-4 w-4 mr-2" />
              {urduTranslations.paymentsPage.paymentRecords}
            </Button>
            <Link href={`/debts?member=${member.id}`}>
              <Button variant="outline" className="mobile-button justify-start w-full urdu-text">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {urduTranslations.debts.manageTotalDues}
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="mobile-button justify-start"
              onClick={() => {
                if (member.phone) {
                  const message = `Assalamu Alaikum ${member.name}, this is a reminder about your mosque committee dues. Please contact us for payment details. JazakAllah Khair.`;
                  const whatsappUrl = `https://wa.me/${member.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                } else {
                  alert('No phone number available for this member');
                }
              }}
            >
              <Phone className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
            <Button 
              variant="outline" 
              className="mobile-button justify-start bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Member
            </Button>
          </div>
        </CardContent>
      </Card> */}

      {/* Recent Activity */}
      <Card className="mobile-card mobile-optimize">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 urdu-text">
            <History className="h-5 w-5 text-islamic-green" />
            {urduTranslations.dashboard.recentActivity}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <History className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="mobile-body urdu-text">دکھانے کے لیے کوئی حالیہ سرگرمی نہیں</p>
            <p className="mobile-body text-sm urdu-text">ادائیگی کی تاریخ اور واجبات کے ریکارڈز یہاں ظاہر ہوں گے</p>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md mobile-card mobile-optimize">
            <CardHeader>
              <CardTitle className="text-red-600 urdu-heading">رکن حذف کریں</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-red-50 p-4 mb-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-1" />
                  <div className="mr-3 flex-1">
                    <h3 className="mobile-subheading text-red-700 mb-2 urdu-text">تمام ڈیٹا ہمیشہ کے لیے حذف ہو جائے گا!</h3>
                    <p className="mobile-body text-red-600 urdu-text text-sm">
                      آپ <strong>{member.name}</strong> کے تمام ادائیگی اور واجبات کے ریکارڈ بھی حذف کر رہے ہیں۔
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="mobile-body text-gray-600 urdu-text">
                کیا آپ واقعی <strong>{member.name}</strong> کو حذف کرنا چاہتے ہیں؟
                یہ عمل واپس نہیں کیا جا سکتا ہے اور اس سے جڑے تمام ادائیگی اور واجبات کے ریکارڈ بھی حذف ہو جائیں گے۔
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="mobile-button flex-1 urdu-text"
                >
                  منسوخ کریں
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="mobile-button flex-1 bg-red-600 hover:bg-red-700 urdu-text"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      حذف کر رہا ہے...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      حذف کریں
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
