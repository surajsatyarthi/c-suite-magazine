interface TableBlockProps {
    value: {
        rows: {
            _key: string
            cells: string[]
        }[]
    }
}

export default function TableBlock({ value }: TableBlockProps) {
    const { rows } = value
    if (!rows || rows.length === 0) return null

    const [headerRow, ...bodyRows] = rows

    return (
        <div className="my-8 overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200 text-left text-sm">
                <thead>
                    <tr className="bg-gray-50">
                        {headerRow.cells.map((cell, index) => (
                            <th
                                key={index}
                                className="border-b border-gray-200 px-4 py-3 font-serif font-bold text-gray-900"
                            >
                                {cell}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {bodyRows.map((row) => (
                        <tr key={row._key} className="even:bg-gray-50">
                            {row.cells.map((cell, index) => (
                                <td key={index} className="border-b border-gray-200 px-4 py-3 text-gray-700">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
