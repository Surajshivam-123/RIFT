import { useContext } from "react";
import { TransactionContext } from "../context/TransactionContext";

// Custom hook — lives in its own file so Vite fast refresh is happy.
// A file with ONLY a hook export (not a component) is perfectly fine.
export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) {
    throw new Error("useTransactions must be used inside <TransactionProvider>");
  }
  return ctx;
}