import { describe, it, expect } from "vitest";
import { calculateBudgetUsage } from "../src/logic/budget.js";

describe("Budget Logic", () => {
  const now = new Date("2025-05-15T10:00:00Z");

  const transactions = [
    {
      amount: 100,
      type: "EXPENSE",
      category: "Food",
      date: new Date("2025-05-10"),
    },
    {
      amount: 50,
      type: "EXPENSE",
      category: "Transport",
      date: new Date("2025-05-12"),
    },
    {
      amount: 200,
      type: "INCOME", // Should be ignored
      category: "Salary",
      date: new Date("2025-05-01"),
    },
    {
      amount: 30,
      type: "EXPENSE",
      category: "Food",
      date: new Date("2025-04-20"), // Previous month
    },
  ];

  it("should calculate total monthly expense for ALL category", () => {
    const budget = { amount: 1000, category: "ALL", period: "MONTHLY" as const };
    const used = calculateBudgetUsage(budget, transactions, now);
    // 100 (Food) + 50 (Transport) = 150. (Income ignored, prev month ignored)
    expect(used).toBe(150);
  });

  it("should calculate specific category monthly expense", () => {
    const budget = { amount: 500, category: "Food", period: "MONTHLY" as const };
    const used = calculateBudgetUsage(budget, transactions, now);
    // 100 (Food) only. Transport ignored.
    expect(used).toBe(100);
  });

  it("should calculate yearly expense", () => {
    const budget = { amount: 10000, category: "ALL", period: "YEARLY" as const };
    const used = calculateBudgetUsage(budget, transactions, now);
    // 100 (Food) + 50 (Transport) + 30 (Apr is same year) = 180
    expect(used).toBe(180);
  });

  it("should return 0 if no matching transactions", () => {
    const budget = { amount: 500, category: "Entertainment", period: "MONTHLY" as const };
    const used = calculateBudgetUsage(budget, transactions, now);
    expect(used).toBe(0);
  });
});
