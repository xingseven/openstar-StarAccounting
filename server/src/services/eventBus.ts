type EventHandler<T = unknown> = (data: T) => Promise<void> | void;

type EventMap = {
  "transaction:import:start": { userId: string; fileName: string; source: "wechat" | "alipay"; rowCount: number };
  "transaction:import:row": { userId: string; row: Record<string, string>; source: "wechat" | "alipay" };
  "transaction:import:complete": { userId: string; fileName: string; imported: number; skipped: number; errors: number };
  "transaction:import:error": { userId: string; fileName: string; error: string };
  "transaction:create": { userId: string; transactionId: string; amount: number; category: string };
  "transaction:delete": { userId: string; transactionId: string };
  "budget:alert": { userId: string; budgetId: string; category: string; percent: number; status: string };
  "anomaly:detected": { userId: string; anomalyId: string; type: string; severity: string; amount: number };
};

type EventKey = keyof EventMap;

class EventBus {
  private handlers: Map<EventKey, Set<EventHandler<any>>> = new Map();
  private queue: Array<{ event: EventKey; data: unknown; timestamp: Date }> = [];
  private processing = false;
  private maxQueueSize = 1000;

  on<K extends EventKey>(event: K, handler: EventHandler<EventMap[K]>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  off<K extends EventKey>(event: K, handler: EventHandler<EventMap[K]>): void {
    this.handlers.get(event)?.delete(handler);
  }

  emit<K extends EventKey>(event: K, data: EventMap[K]): void {
    if (this.queue.length >= this.maxQueueSize) {
      console.warn(`[EventBus] Queue overflow, dropping oldest event: ${event}`);
      this.queue.shift();
    }

    this.queue.push({ event, data, timestamp: new Date() });
    this.processQueue();
  }

  emitSync<K extends EventKey>(event: K, data: EventMap[K]): void {
    const handlers = this.handlers.get(event);
    if (!handlers) return;

    for (const handler of handlers) {
      try {
        handler(data);
      } catch (error) {
        console.error(`[EventBus] Error in handler for ${event}:`, error);
      }
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      const handlers = this.handlers.get(item.event);
      if (!handlers) continue;

      const promises: Promise<void>[] = [];

      for (const handler of handlers) {
        try {
          const result = handler(item.data);
          if (result instanceof Promise) {
            promises.push(result);
          }
        } catch (error) {
          console.error(`[EventBus] Error in handler for ${item.event}:`, error);
        }
      }

      if (promises.length > 0) {
        await Promise.allSettled(promises);
      }
    }

    this.processing = false;
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  clearQueue(): void {
    this.queue = [];
  }
}

export const eventBus = new EventBus();

export function setupEventHandlers(): void {
  eventBus.on("transaction:import:start", async (data) => {
    console.log(`[ETL] Import started: ${data.fileName} (${data.rowCount} rows) for user ${data.userId}`);
  });

  eventBus.on("transaction:import:complete", async (data) => {
    console.log(`[ETL] Import completed: ${data.fileName} - Imported: ${data.imported}, Skipped: ${data.skipped}, Errors: ${data.errors}`);
  });

  eventBus.on("transaction:import:error", async (data) => {
    console.error(`[ETL] Import error: ${data.fileName} - ${data.error}`);
  });

  eventBus.on("anomaly:detected", async (data) => {
    console.log(`[Anomaly] Detected: ${data.type} (${data.severity}) - ¥${data.amount} for user ${data.userId}`);
  });
}

export type { EventBus, EventMap, EventKey, EventHandler };
