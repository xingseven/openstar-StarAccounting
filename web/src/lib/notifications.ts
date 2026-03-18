export type NotificationPayload = {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
};

export type NotificationPermission = "granted" | "denied" | "default";

class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;

  async init(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    
    if (!("Notification" in window)) {
      console.log("[Notification] Not supported");
      return false;
    }

    if (!("serviceWorker" in navigator)) {
      console.log("[Notification] Service Worker not supported");
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      console.log("[Notification] Service Worker ready");
      return true;
    } catch (error) {
      console.error("[Notification] Init failed:", error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined") return "denied";
    
    if (!("Notification" in window)) {
      return "denied";
    }

    const permission = await Notification.requestPermission();
    return permission as NotificationPermission;
  }

  getPermission(): NotificationPermission {
    if (typeof window === "undefined") return "denied";
    
    if (!("Notification" in window)) {
      return "denied";
    }

    return Notification.permission as NotificationPermission;
  }

  async show(payload: NotificationPayload): Promise<boolean> {
    const permission = this.getPermission();
    
    if (permission !== "granted") {
      console.log("[Notification] Permission not granted");
      return false;
    }

    try {
      if (this.registration) {
        await this.registration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon || "/icons/icon-192x192.png",
          badge: payload.badge || "/icons/badge-72x72.png",
          tag: payload.tag,
          data: payload.data,
          actions: payload.actions,
          vibrate: [100, 50, 100],
        });
      } else {
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || "/icons/icon-192x192.png",
          tag: payload.tag,
          data: payload.data,
        });
      }
      
      console.log("[Notification] Shown:", payload.title);
      return true;
    } catch (error) {
      console.error("[Notification] Show failed:", error);
      return false;
    }
  }

  async showBudgetAlert(
    category: string,
    percent: number,
    status: "warning" | "overdue"
  ): Promise<boolean> {
    const title = status === "overdue" ? "预算超支提醒" : "预算预警";
    const body =
      status === "overdue"
        ? `您的"${category}"预算已超支 ${percent.toFixed(0)}%，请及时调整支出计划。`
        : `您的"${category}"预算已使用 ${percent.toFixed(0)}%，请注意控制支出。`;

    return this.show({
      title,
      body,
      tag: `budget-${category}`,
      data: { type: "budget-alert", category, percent, status },
      actions: [
        { action: "view", title: "查看详情" },
        { action: "dismiss", title: "忽略" },
      ],
    });
  }

  async showAnomalyAlert(
    type: string,
    amount: number,
    category: string
  ): Promise<boolean> {
    const title = "异常消费提醒";
    const body = `检测到${type}：${category}类别下有一笔 ¥${amount.toFixed(2)} 的消费，请确认是否为正常支出。`;

    return this.show({
      title,
      body,
      tag: `anomaly-${type}`,
      data: { type: "anomaly-alert", anomalyType: type, amount, category },
      actions: [
        { action: "view", title: "查看详情" },
        { action: "dismiss", title: "忽略" },
      ],
    });
  }

  async showImportComplete(
    fileName: string,
    imported: number,
    skipped: number
  ): Promise<boolean> {
    const title = "账单导入完成";
    const body = `成功导入 ${imported} 条记录${skipped > 0 ? `，跳过 ${skipped} 条重复记录` : ""}。`;

    return this.show({
      title,
      body,
      tag: "import-complete",
      data: { type: "import-complete", fileName, imported, skipped },
    });
  }

  async clearAll(): Promise<void> {
    if (this.registration) {
      const notifications = await this.registration.getNotifications();
      notifications.forEach((notification) => notification.close());
    }
  }

  async clearByTag(tag: string): Promise<void> {
    if (this.registration) {
      const notifications = await this.registration.getNotifications({ tag });
      notifications.forEach((notification) => notification.close());
    }
  }
}

export const notificationService = new NotificationService();

export function useNotification() {
  const requestPermission = async () => {
    return notificationService.requestPermission();
  };

  const show = async (payload: NotificationPayload) => {
    return notificationService.show(payload);
  };

  const showBudgetAlert = async (
    category: string,
    percent: number,
    status: "warning" | "overdue"
  ) => {
    return notificationService.showBudgetAlert(category, percent, status);
  };

  const showAnomalyAlert = async (type: string, amount: number, category: string) => {
    return notificationService.showAnomalyAlert(type, amount, category);
  };

  const getPermission = () => {
    return notificationService.getPermission();
  };

  return {
    requestPermission,
    show,
    showBudgetAlert,
    showAnomalyAlert,
    getPermission,
  };
}
