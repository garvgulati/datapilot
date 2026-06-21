export function DataTable({ rows, limit = 10 }: { rows: Record<string, unknown>[]; limit?: number }) {
  const visibleRows = rows.slice(0, limit);
  const columns = visibleRows[0] ? Object.keys(visibleRows[0]) : [];

  if (!visibleRows.length) {
    return <div className="enterprise-panel p-4 text-sm text-slate-500">No rows available.</div>;
  }

  return (
    <div className="enterprise-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column} className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleRows.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column} className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {String(row[column] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
