class EventBus {
    handlers = new Map();
    queue = [];
    processing = false;
    maxQueueSize = 1000;
    on(event, handler) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        this.handlers.get(event).add(handler);
        return () => {
            this.handlers.get(event)?.delete(handler);
        };
    }
    off(event, handler) {
        this.handlers.get(event)?.delete(handler);
    }
    emit(event, data) {
        if (this.queue.length >= this.maxQueueSize) {
            console.warn(`[EventBus] Queue overflow, dropping oldest event: ${event}`);
            this.queue.shift();
        }
        this.queue.push({ event, data, timestamp: new Date() });
        this.processQueue();
    }
    emitSync(event, data) {
        const handlers = this.handlers.get(event);
        if (!handlers)
            return;
        for (const handler of handlers) {
            try {
                handler(data);
            }
            catch (error) {
                console.error(`[EventBus] Error in handler for ${event}:`, error);
            }
        }
    }
    async processQueue() {
        if (this.processing)
            return;
        this.processing = true;
        while (this.queue.length > 0) {
            const item = this.queue.shift();
            if (!item)
                break;
            const handlers = this.handlers.get(item.event);
            if (!handlers)
                continue;
            const promises = [];
            for (const handler of handlers) {
                try {
                    const result = handler(item.data);
                    if (result instanceof Promise) {
                        promises.push(result);
                    }
                }
                catch (error) {
                    console.error(`[EventBus] Error in handler for ${item.event}:`, error);
                }
            }
            if (promises.length > 0) {
                await Promise.allSettled(promises);
            }
        }
        this.processing = false;
    }
    getQueueLength() {
        return this.queue.length;
    }
    clearQueue() {
        this.queue = [];
    }
}
export const eventBus = new EventBus();
export function setupEventHandlers() {
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
