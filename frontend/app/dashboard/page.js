"use client";

import { Header } from "../components/Header";
import { AccountInfo } from "../components/AccountInfo";
import { TransactionForm } from "../components/TransactionForm";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          Built with Scaffold-XRP
        </div>
      </footer>
    </div>
  );
}
