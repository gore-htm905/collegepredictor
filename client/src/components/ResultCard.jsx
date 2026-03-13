import React from 'react';

const ResultCard = ({ college }) => {
    const getStatusClass = (type) => {
        switch (type.toLowerCase()) {
            case 'safe': return 'status-safe';
            case 'moderate': return 'status-moderate';
            case 'dream': return 'status-dream';
            default: return '';
        }
    };

    return (
        <div className="result-card">
            <div className="card-header">
                <h3>{college.instituteName}</h3>
                <span className={`status-badge ${getStatusClass(college.predictionType)}`}>
                    {college.predictionType}
                </span>
            </div>
            <div className="card-content">
                <p><strong>Branch:</strong> {college.branch}</p>
                <p><strong>Category:</strong> {college.category}</p>
                <p><strong>Cutoff Percentile:</strong> {college.percentile}</p>
            </div>
        </div>
    );
};

export default ResultCard;
