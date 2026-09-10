import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { StoredSnapshot } from '../types';

interface FalconDB extends DBSchema {
  snapshots: {
    key: string;
    value: StoredSnapshot;
    indexes: {
      'by-timestamp': string;
      'by-risk': number;
      'by-detected': number;
    };
  };
}

const DB_NAME = 'falcon-landslide-db';
const DB_VERSION = 1;

class SnapshotDatabase {
  private dbPromise: Promise<IDBPDatabase<FalconDB>> | null = null;

  private getDB(): Promise<IDBPDatabase<FalconDB>> {
    if (!this.dbPromise) {
      this.dbPromise = openDB<FalconDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('snapshots')) {
            const store = db.createObjectStore('snapshots', { keyPath: 'id' });
            store.createIndex('by-timestamp', 'timestamp');
            store.createIndex('by-risk', 'riskScore');
            store.createIndex('by-detected', 'analysis.detected');
          }
        },
      });
    }
    return this.dbPromise;
  }

  async saveSnapshot(snapshot: StoredSnapshot): Promise<void> {
    const db = await this.getDB();
    await db.put('snapshots', snapshot);
  }

  async getSnapshot(id: string): Promise<StoredSnapshot | undefined> {
    const db = await this.getDB();
    return db.get('snapshots', id);
  }

  async getAllSnapshots(): Promise<StoredSnapshot[]> {
    const db = await this.getDB();
    const all = await db.getAll('snapshots');
    // Sort newest first
    return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async deleteSnapshot(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('snapshots', id);
  }

  async clearAll(): Promise<void> {
    const db = await this.getDB();
    await db.clear('snapshots');
  }

  async count(): Promise<number> {
    const db = await this.getDB();
    return db.count('snapshots');
  }
}

export const snapshotDB = new SnapshotDatabase();
