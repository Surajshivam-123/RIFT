/**
 * App.jsx
 *
 * Three pages, no React Router needed — just a local `page` state.
 *
 * Pages:
 *   "addfile"  → AddFilePage   — upload CSV, animating drop zone
 *   "graph"    → GraphPage_Animated — physics graph
 *   "details"  → ShowDetailsPage — full transaction table
 *
 * Shared state:
 *   selectedIds — Set<string> — nodes selected on the graph page,
 *                 passed to ShowDetailsPage so it can filter by them.
 */

import { useState } from "react";
import { TransactionProvider } from "./context/TransactionContext";
import AddFilePage        from "./pages/AddFilePage";
import GraphPage from "./pages/GraphPage";
import ShowDetailsPage    from "./pages/Showdetailspage";

export default function App() {
  const [page, setPage]               = useState("addfile"); // "addfile" | "graph" | "details"
  const [selectedIds, setSelectedIds] = useState(new Set());

  function navigate(target) {
    setPage(target);
  }

  return (
    <TransactionProvider>
      {page === "addfile" && (
        <AddFilePage onNavigate={navigate} />
      )}
      {page === "graph" && (
        <GraphPage
          onNavigate={navigate}
          onSelectionChange={setSelectedIds}
        />
      )}
      {page === "details" && (
        <ShowDetailsPage
          selectedIds={selectedIds}
          onNavigate={navigate}
        />
      )}
    </TransactionProvider>
  );
}