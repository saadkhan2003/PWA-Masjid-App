import { openDB, IDBPDatabase } from 'idb';
import { Member, Payment, Debt, OfflineOperation } from '@/types/app';

const DB_NAME = 'mosque-committee';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

export const initDB = async (): Promise<IDBPDatabase> => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object stores for offline data
      if (!db.objectStoreNames.contains('members')) {
        db.createObjectStore('members', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('payments')) {
        db.createObjectStore('payments', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('debts')) {
        db.createObjectStore('debts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('offline-queue')) {
        db.createObjectStore('offline-queue', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('app-state')) {
        db.createObjectStore('app-state', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
};

// Generic CRUD operations for offline storage
export const offlineStorage = {
  // Members
  members: {
    getAll: async (): Promise<Member[]> => {
      const db = await initDB();
      return db.getAll('members');
    },
    
    get: async (id: string): Promise<Member | undefined> => {
      const db = await initDB();
      return db.get('members', id);
    },
    
    put: async (member: Member): Promise<void> => {
      const db = await initDB();
      await db.put('members', member);
    },
    
    delete: async (id: string): Promise<void> => {
      const db = await initDB();
      await db.delete('members', id);
    },
    
    sync: async (members: Member[]): Promise<void> => {
      const db = await initDB();
      const tx = db.transaction('members', 'readwrite');
      await tx.store.clear();
      await Promise.all(members.map(member => tx.store.put(member)));
      await tx.done;
    }
  },

  // Payments
  payments: {
    getAll: async (): Promise<Payment[]> => {
      const db = await initDB();
      return db.getAll('payments');
    },
    
    put: async (payment: Payment): Promise<void> => {
      const db = await initDB();
      await db.put('payments', payment);
    },
    
    delete: async (id: string): Promise<void> => {
      const db = await initDB();
      await db.delete('payments', id);
    },
    
    sync: async (payments: Payment[]): Promise<void> => {
      const db = await initDB();
      const tx = db.transaction('payments', 'readwrite');
      await tx.store.clear();
      await Promise.all(payments.map(payment => tx.store.put(payment)));
      await tx.done;
    }
  },

  // Debts
  debts: {
    getAll: async (): Promise<Debt[]> => {
      const db = await initDB();
      return db.getAll('debts');
    },
    
    put: async (debt: Debt): Promise<void> => {
      const db = await initDB();
      await db.put('debts', debt);
    },
    
    sync: async (debts: Debt[]): Promise<void> => {
      const db = await initDB();
      const tx = db.transaction('debts', 'readwrite');
      await tx.store.clear();
      await Promise.all(debts.map(debt => tx.store.put(debt)));
      await tx.done;
    }
  },

  // Offline operations queue
  queue: {
    add: async (operation: Omit<OfflineOperation, 'id'>): Promise<void> => {
      const db = await initDB();
      await db.add('offline-queue', operation);
    },
    
    getAll: async (): Promise<OfflineOperation[]> => {
      const db = await initDB();
      return db.getAll('offline-queue');
    },
    
    remove: async (id: number): Promise<void> => {
      const db = await initDB();
      await db.delete('offline-queue', id);
    },
    
    clear: async (): Promise<void> => {
      const db = await initDB();
      await db.clear('offline-queue');
    }
  },

  // App state
  state: {
    get: async (key: string): Promise<any> => {
      const db = await initDB();
      const result = await db.get('app-state', key);
      return result?.value;
    },
    
    set: async (key: string, value: any): Promise<void> => {
      const db = await initDB();
      await db.put('app-state', { key, value });
    }
  }
};

// Cache management
export const cacheManager = {
  isDataFresh: async (key: string, maxAgeMs: number = 5 * 60 * 1000): Promise<boolean> => {
    const lastSync = await offlineStorage.state.get(`last-sync-${key}`);
    if (!lastSync) return false;
    
    const age = Date.now() - new Date(lastSync).getTime();
    return age < maxAgeMs;
  },
  
  markSynced: async (key: string): Promise<void> => {
    await offlineStorage.state.set(`last-sync-${key}`, new Date().toISOString());
  }
};
