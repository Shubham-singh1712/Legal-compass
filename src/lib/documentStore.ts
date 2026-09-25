import { UserContext } from '@/types/legal';
import { resolveFixture } from './fixtureTexts';

const fixturesEnabled = process.env.LEGAL_COMPASS_ENABLE_FIXTURES === 'true';

export interface StoredDocument {
  id: string;
  sessionId: string;
  filename: string;
  fileSize: number;
  fileType: string;
  extractedText: string;
  pageCount: number;
  userContext?: UserContext | null;
  uploadedAt: string;
  metadata?: Record<string, any>;
}

// In-memory store surviving across API calls within the Node.js server lifecycle
const globalStore = global as unknown as {
  __legalCompassDocumentStore?: Map<string, StoredDocument>;
};

if (!globalStore.__legalCompassDocumentStore) {
  globalStore.__legalCompassDocumentStore = new Map<string, StoredDocument>();
}

export const documentStore = {
  get(id: string, sessionId?: string): StoredDocument | undefined {
    let doc = globalStore.__legalCompassDocumentStore?.get(id);
    if (doc && sessionId && doc.sessionId !== sessionId) return undefined;
    if (doc) return doc;

    // Fixtures are available only to explicit evaluation scripts, never normal app traffic.
    const fixture = fixturesEnabled ? resolveFixture(id) : undefined;
    if (fixture) {
      doc = {
        id,
        sessionId: 'fixture-session',
        filename: fixture.filename,
        fileSize: fixture.text.length,
        fileType: 'application/pdf',
        extractedText: fixture.text,
        pageCount: fixture.pageCount,
        uploadedAt: new Date().toISOString(),
      };
      globalStore.__legalCompassDocumentStore?.set(id, doc);
      return doc;
    }

    return undefined;
  },

  set(id: string, doc: StoredDocument): void {
    globalStore.__legalCompassDocumentStore?.set(id, doc);
  },

  updateUserContext(id: string, userContext: UserContext, sessionId?: string): void {
    const doc = this.get(id, sessionId);
    if (doc) {
      doc.userContext = userContext;
      this.set(id, doc);
    }
  },

  has(id: string, sessionId?: string): boolean {
    const stored = globalStore.__legalCompassDocumentStore?.get(id);
    if (stored && (!sessionId || stored.sessionId === sessionId)) return true;
    return fixturesEnabled && !!resolveFixture(id);
  },

  delete(id: string): boolean {
    return globalStore.__legalCompassDocumentStore?.delete(id) ?? false;
  },

  getAll(): StoredDocument[] {
    return Array.from(globalStore.__legalCompassDocumentStore?.values() ?? []);
  },

  getAllForSession(sessionId: string): StoredDocument[] {
    return this.getAll().filter((document) => document.sessionId === sessionId);
  },
};
