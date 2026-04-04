export function calculateBudgetUsage(budget, transactions, now = new Date()) {
    let used = 0;
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    for (const t of transactions) {
        if (t.type !== "EXPENSE")
            continue;
        const scopeType = budget.scopeType || "GLOBAL";
        if (scopeType === "CATEGORY" && budget.category !== "ALL" && t.category !== budget.category)
            continue;
        if (scopeType === "PLATFORM" && budget.platform && t.platform !== budget.platform)
            continue;
        if (scopeType === "GLOBAL" && budget.category !== "ALL" && t.category !== budget.category)
            continue;
        const d = new Date(t.date);
        if (Number.isNaN(d.getTime()))
            continue;
        if (budget.period === "MONTHLY") {
            if (d.getFullYear() !== currentYear || d.getMonth() !== currentMonth)
                continue;
        }
        else {
            if (d.getFullYear() !== currentYear)
                continue;
        }
        used += Number(t.amount);
    }
    return used;
}
export function calculateBudgetHealth(budget, transactions, now = new Date()) {
    const used = calculateBudgetUsage(budget, transactions, now);
    const budgetAmount = Number(budget.amount);
    const percent = budgetAmount > 0 ? (used / budgetAmount) * 100 : 0;
    const alertPercent = budget.alertPercent ?? 80;
    let status = "normal";
    if (percent >= 100) {
        status = "overdue";
    }
    else if (percent >= alertPercent) {
        status = "warning";
    }
    return {
        used,
        percent,
        status,
        alertPercent,
    };
}
