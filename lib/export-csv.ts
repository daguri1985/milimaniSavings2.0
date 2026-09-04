// lib/export-csv.ts

import { TransactionRecord } from '@/app/actions/payments';

export function exportTransactionsToCSV(
  transactions: TransactionRecord[],
  filename = 'milimani-contributions.csv'
) {
  if (!transactions || transactions.length === 0) {
    alert('No transactions available to export.');
    return;
  }

  // Define CSV headers
  const headers = [
    'Transaction ID',
    'Member Name',
    'Phone Number',
    'Amount (KES)',
    'M-Pesa Receipt',
    'Status',
    'Week',
    'Date Recorded',
  ];

  // Map transaction objects into clean CSV rows
  const rows = transactions.map((tx) => {
    // Safely extract relational structures (handles single object or array returns)
    const member = Array.isArray(tx.member) ? tx.member[0] : tx.member;
    const week = Array.isArray(tx.week) ? tx.week[0] : tx.week;

    const fullName = member?.full_name || 'N/A';
    const phoneNumber = member?.phone_number || 'N/A';
    const receipt = tx.mpesa_receipt_number || 'N/A';
    const weekLabel = week?.id ? `Week ${week.id}` : 'N/A';
    const dateFormatted = new Date(tx.paid_at || tx.created_at).toLocaleString('en-KE');

    return [
      tx.id,
      `"${fullName}"`,
      `"${phoneNumber}"`,
      tx.amount_paid,
      `"${receipt}"`,
      tx.status,
      weekLabel,
      `"${dateFormatted}"`,
    ];
  });

  // Construct CSV string content
  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  // Trigger browser file download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}