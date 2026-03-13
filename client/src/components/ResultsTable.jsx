import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ResultsTable = ({ results }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filtered = results.filter(item =>
        item.instituteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.branch.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusLabel = (status) => {
        const labels = {
            'SAFE': 'status-safe',
            'MODERATE': 'status-moderate',
            'DREAM': 'status-dream'
        };
        return labels[status?.toUpperCase()] || '';
    };

    return (
        <div className="results-container">
            <div className="results-header">
                <div className="info">
                    <h3>Matching Colleges</h3>
                    <p>Total {filtered.length} institutes found</p>
                </div>
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by college or branch..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Institute Name</th>
                            <th>Location / Region</th>
                            <th>Branch</th>
                            <th>Category</th>
                            <th>Cutoff</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((item, idx) => (
                            <tr key={idx}>
                                <td>
                                    <div className="college-info">
                                        <strong>{item.instituteName}</strong>
                                        <span>Code: {item.instituteCode || 'N/A'}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="location-info">
                                        <strong>{item.city}</strong>
                                        <span>{item.region}</span>
                                    </div>
                                </td>
                                <td>{item.branch}</td>
                                <td>{item.categoryCode || item.category}</td>
                                <td>{item.percentile}</td>
                                <td>
                                    <span className={`badge ${getStatusLabel(item.status)}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-btn"
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-btn"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResultsTable;
