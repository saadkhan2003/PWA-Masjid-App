import { membersQueries, paymentsQueries, debtsQueries } from '../supabase/queries';
import { offlineStorage, cacheManager } from './storage';
import { OfflineOperation } from '@/types/app';
import { processPayment, updateMemberTotalDebt } from '@/lib/utils/debt-automation';

export class SyncManager {
  private static instance: SyncManager;
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  constructor() {
    this.setupNetworkListeners();
  }

  private setupNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.syncAll();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  // Sync all data from server to local storage
  async syncAll(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) return;
    
    this.syncInProgress = true;
    
    try {
      // Process offline operations first
      await this.processOfflineOperations();
      
      // Sync data from server
      await Promise.all([
        this.syncMembers(),
        this.syncPayments(),
        this.syncDebts()
      ]);
      
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sync members data
  private async syncMembers(): Promise<void> {
    try {
      const members = await membersQueries.getAll();
      await offlineStorage.members.sync(members);
      await cacheManager.markSynced('members');
    } catch (error) {
      console.error('Failed to sync members:', error);
    }
  }

  // Sync payments data
  private async syncPayments(): Promise<void> {
    try {
      const payments = await paymentsQueries.getAll();
      await offlineStorage.payments.sync(payments);
      await cacheManager.markSynced('payments');
    } catch (error) {
      console.error('Failed to sync payments:', error);
    }
  }

  // Sync debts data
  private async syncDebts(): Promise<void> {
    try {
      const debts = await debtsQueries.getAll();
      await offlineStorage.debts.sync(debts);
      await cacheManager.markSynced('debts');
    } catch (error) {
      console.error('Failed to sync debts:', error);
    }
  }

  // Process offline operations queue
  private async processOfflineOperations(): Promise<void> {
    const operations = await offlineStorage.queue.getAll();
    
    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
        if (operation.id) {
          await offlineStorage.queue.remove(operation.id);
        }
      } catch (error) {
        console.error('Failed to process offline operation:', operation, error);
      }
    }
  }

  // Execute individual offline operation
  private async executeOperation(operation: OfflineOperation): Promise<void> {
    const { type, table, data } = operation;
    
    switch (table) {
      case 'members':
        if (type === 'CREATE') {
          await membersQueries.create(data);
        } else if (type === 'UPDATE') {
          await membersQueries.update(data.id, data);
        } else if (type === 'DELETE') {
          await membersQueries.delete(data.id);
        }
        break;
        
      case 'payments':
        if (type === 'CREATE') {
          // Create the payment
          const savedPayment = await paymentsQueries.create(data);
          
          // Check if this payment needs debt processing (flag set during offline creation)
          if (data._needsDebtProcessing && savedPayment.member_id) {
            try {
              // Process payment against debt
              await processPayment(
                savedPayment.member_id,
                savedPayment.amount,
                savedPayment.payment_date
              );
              console.log(`Synced payment processed against debts for member ${savedPayment.member_id}`);
            } catch (debtError) {
              console.error('Failed to process synced payment against debts:', debtError);
              
              // Attempt direct debt update as fallback
              try {
                await updateMemberTotalDebt(savedPayment.member_id);
                console.log(`Direct debt recalculation for member ${savedPayment.member_id} after sync`);
              } catch (updateError) {
                console.error('Failed direct debt recalculation after sync:', updateError);
              }
            }
          }
        } else if (type === 'DELETE') {
          await paymentsQueries.delete(data.id);
          
          // If member_id is available, update their total debt
          if (data.member_id) {
            try {
              await updateMemberTotalDebt(data.member_id);
              console.log(`Updated debt for member ${data.member_id} after payment deletion sync`);
            } catch (error) {
              console.error('Failed to update debt after payment deletion sync:', error);
            }
          }
        } else if (type === 'UPDATE') {
          await paymentsQueries.update(data.id, data);
        }
        break;
        
      case 'debts':
        if (type === 'CREATE') {
          await debtsQueries.create(data);
        } else if (type === 'UPDATE') {
          await debtsQueries.updateStatus(data.id, data.status);
        }
        break;
    }
  }

  // Add operation to offline queue
  async addOfflineOperation(
    type: OfflineOperation['type'],
    table: OfflineOperation['table'],
    data: any
  ): Promise<void> {
    const operation: Omit<OfflineOperation, 'id'> = {
      type,
      table,
      data,
      timestamp: new Date().toISOString(),
      synced: false
    };
    
    await offlineStorage.queue.add(operation);
  }

  // Get network status
  getNetworkStatus(): boolean {
    return this.isOnline;
  }

  // Force sync
  async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncAll();
    }
  }
}

// Export singleton instance
export const syncManager = SyncManager.getInstance();
