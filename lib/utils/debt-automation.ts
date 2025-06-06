import { Member, Debt } from '@/types/app';
import { debtsQueries, membersQueries } from '@/lib/supabase/queries';

// Monthly dues amount - can be configured
export const MONTHLY_DUES_AMOUNT = 200;

/**
 * Calculate monthly debt for a member based on their join date
 * @param member - The member to calculate debt for
 * @param lastPaymentDate - Date of last payment (optional)
 * @returns Object with debt details
 */
export function calculateMemberDebt(member: Member, lastPaymentDate?: string) {
  const now = new Date();
  const joinDate = new Date(member.join_date);
  const lastPaid = lastPaymentDate ? new Date(lastPaymentDate) : joinDate;
  
  // Calculate months since join date
  const monthsSinceJoin = getMonthsDifference(joinDate, now);
  
  // Calculate months since last payment
  const monthsSinceLastPayment = getMonthsDifference(lastPaid, now);
  
  // Total debt is monthly dues * months unpaid
  const totalDebt = monthsSinceLastPayment * member.monthly_dues;
  
  return {
    monthsSinceJoin,
    monthsSinceLastPayment,
    totalDebt,
    monthlyDues: member.monthly_dues,
    isOverdue: monthsSinceLastPayment > 1
  };
}

/**
 * Get difference in months between two dates
 */
function getMonthsDifference(startDate: Date, endDate: Date): number {
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  return Math.max(0, yearDiff * 12 + monthDiff);
}

/**
 * Generate monthly debt entries for all active members
 */
export async function generateMonthlyDebts(): Promise<void> {
  try {
    console.log('Starting monthly debt generation...');
    
    // Get all active members
    const members = await membersQueries.getAll();
    const activeMembers = members.filter(m => m.status === 'active');
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    console.log(`Processing ${activeMembers.length} active members for ${currentMonth}/${currentYear}`);
    
    for (const member of activeMembers) {
      try {
        // Check if debt already exists for this month
        const existingDebts = await debtsQueries.getAll();
        const existingDebt = existingDebts.find(debt => 
          debt.member_id === member.id && 
          debt.month === currentMonth && 
          debt.year === currentYear &&
          debt.type === 'monthly_dues'
        );
        
        if (!existingDebt) {
          // Create new monthly debt
          const newDebt: Omit<Debt, 'id' | 'created_at' | 'updated_at'> = {
            member_id: member.id,
            amount: member.monthly_dues,
            type: 'monthly_dues',
            description: `Monthly dues for ${getMonthName(currentMonth)} ${currentYear}`,
            due_date: new Date(currentYear, currentMonth, 1).toISOString(), // Due on 1st of next month
            status: 'pending',
            month: currentMonth,
            year: currentYear
          };
          
          await debtsQueries.create(newDebt);
          console.log(`Created monthly debt for ${member.name}: Rs ${member.monthly_dues}`);
        } else {
          console.log(`Monthly debt already exists for ${member.name}`);
        }
      } catch (error) {
        console.error(`Failed to create debt for member ${member.name}:`, error);
      }
    }
    
    console.log('Monthly debt generation completed');
  } catch (error) {
    console.error('Failed to generate monthly debts:', error);
    throw error;
  }
}

/**
 * Update member's total debt based on all pending debts
 */
export async function updateMemberTotalDebt(memberId: string): Promise<number> {
  try {
    const debts = await debtsQueries.getAll();
    const memberDebts = debts.filter(debt => 
      debt.member_id === memberId && 
      (debt.status === 'pending' || debt.status === 'overdue')
    );
    
    const totalDebt = memberDebts.reduce((sum, debt) => sum + debt.amount, 0);
    
    // Update member's total_debt field
    await membersQueries.update(memberId, { total_debt: totalDebt });
    
    return totalDebt;
  } catch (error) {
    console.error(`Failed to update total debt for member ${memberId}:`, error);
    throw error;
  }
}

/**
 * Update overdue status for all pending debts
 */
export async function updateOverdueDebts(): Promise<void> {
  try {
    const debts = await debtsQueries.getAll();
    const now = new Date();
    
    for (const debt of debts) {
      if (debt.status === 'pending' && new Date(debt.due_date) < now) {
        await debtsQueries.updateStatus(debt.id, 'overdue');
        console.log(`Marked debt ${debt.id} as overdue`);
      }
    }
  } catch (error) {
    console.error('Failed to update overdue debts:', error);
    throw error;
  }
}

/**
 * Process payment and update related debts
 */
export async function processPayment(memberId: string, amount: number, paymentDate: string): Promise<void> {
  try {
    // Get member's pending debts (oldest first)
    const debts = await debtsQueries.getAll();
    const memberDebts = debts
      .filter(debt => 
        debt.member_id === memberId && 
        (debt.status === 'pending' || debt.status === 'overdue')
      )
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    
    let remainingAmount = amount;
    
    // Pay off debts starting from oldest
    for (const debt of memberDebts) {
      if (remainingAmount <= 0) break;
      
      if (remainingAmount >= debt.amount) {
        // Pay off entire debt
        await debtsQueries.updateStatus(debt.id, 'paid');
        remainingAmount -= debt.amount;
        console.log(`Paid off debt ${debt.id} completely`);
      } else {
        // Partial payment - create new debt for remaining amount
        const remainingDebt = debt.amount - remainingAmount;
        
        // Mark original debt as paid
        await debtsQueries.updateStatus(debt.id, 'paid');
        
        // Create new debt for remaining amount
        const newDebt: Omit<Debt, 'id' | 'created_at' | 'updated_at'> = {
          member_id: debt.member_id,
          amount: remainingDebt,
          due_date: debt.due_date,
          status: 'pending',
          description: `${debt.description} (Partial payment remaining)`,
          type: debt.type,
          month: debt.month,
          year: debt.year
        };
        
        await debtsQueries.create(newDebt);
        remainingAmount = 0;
        console.log(`Partial payment processed for debt ${debt.id}`);
      }
    }
    
    // Update member's total debt
    await updateMemberTotalDebt(memberId);
    
    console.log(`Payment processed: Rs ${amount} for member ${memberId}`);
  } catch (error) {
    console.error(`Failed to process payment for member ${memberId}:`, error);
    throw error;
  }
}

/**
 * Generate historical debts for a new member from their join date to current month
 */
export async function generateHistoricalDebts(memberId: string): Promise<void> {
  try {
    const member = await membersQueries.getById(memberId);
    if (!member) throw new Error('Member not found');
    
    const joinDate = new Date(member.join_date);
    const currentDate = new Date();
    
    // Generate debts for each month from join date to current month
    const startYear = joinDate.getFullYear();
    const startMonth = joinDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    for (let year = startYear; year <= currentYear; year++) {
      const monthStart = year === startYear ? startMonth : 1;
      const monthEnd = year === currentYear ? currentMonth : 12;
      
      for (let month = monthStart; month <= monthEnd; month++) {
        // Check if debt already exists
        const existingDebts = await debtsQueries.getAll();
        const existingDebt = existingDebts.find(debt => 
          debt.member_id === memberId && 
          debt.month === month && 
          debt.year === year &&
          debt.type === 'monthly_dues'
        );
        
        if (!existingDebt) {
          const newDebt: Omit<Debt, 'id' | 'created_at' | 'updated_at'> = {
            member_id: memberId,
            amount: member.monthly_dues,
            type: 'monthly_dues',
            description: `Monthly dues for ${getMonthName(month)} ${year}`,
            due_date: new Date(year, month, 1).toISOString(),
            status: 'pending',
            month: month,
            year: year
          };
          
          await debtsQueries.create(newDebt);
          console.log(`Created historical debt for ${member.name}: ${getMonthName(month)} ${year}`);
        }
      }
    }
    
    // Update total debt
    await updateMemberTotalDebt(memberId);
  } catch (error) {
    console.error(`Failed to generate historical debts for member ${memberId}:`, error);
    throw error;
  }
}

/**
 * Get month name from number
 */
function getMonthName(monthNumber: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || 'Unknown';
}

/**
 * Schedule monthly debt generation (can be called from a cron job or manually)
 */
export async function scheduleMonthlyDebtGeneration(): Promise<void> {
  try {
    await generateMonthlyDebts();
    await updateOverdueDebts();
    
    // Update all members' total debt
    const members = await membersQueries.getAll();
    for (const member of members) {
      await updateMemberTotalDebt(member.id);
    }
    
    console.log('Monthly debt generation and updates completed successfully');
  } catch (error) {
    console.error('Failed to complete monthly debt generation:', error);
    throw error;
  }
}

/**
 * Initialize debt system for existing members (one-time setup)
 */
export async function initializeDebtSystem(): Promise<void> {
  try {
    console.log('Initializing debt system...');
    
    const members = await membersQueries.getAll();
    
    for (const member of members) {
      if (member.status === 'active') {
        // Generate historical debts for this member
        await generateHistoricalDebts(member.id);
      }
    }
    
    console.log('Debt system initialization completed');
  } catch (error) {
    console.error('Failed to initialize debt system:', error);
    throw error;
  }
}