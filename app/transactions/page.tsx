import { getTransactions } from "@/actions/transactions";
import { TransactionsPageClient } from "@/components/transactions/transactions-page-client";

export default async function TransactionsPage() {
  const { data, count } = await getTransactions({}, 1, 20);

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Transactions</h1>
        <p className="text-sm text-gray-500 mt-0.5">View, search, and manage all transactions</p>
      </div>

      <TransactionsPageClient
        initialTransactions={data}
        initialCount={count}
        fetchTransactions={getTransactions}
      />
    </div>
  );
}
