import React, { useState, useEffect } from 'react';
import { getBranches } from '../services/api';

const PredictorForm = ({ formData, setFormData, onPredict, loading }) => {
    const [branches, setBranches] = useState([]);
    const [branchLoading, setBranchLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);

    const fetchBranches = async () => {
        setBranchLoading(true);
        setFetchError(false);
        try {
            const response = await getBranches();
            if (response.success) {
                setBranches(response.data);
            } else {
                setFetchError(true);
            }
        } catch (error) {
            console.error("Error fetching branches:", error);
            setFetchError(true);
        } finally {
            setBranchLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const categories = [
        { label: 'OPEN', value: 'OPEN' },
        { label: 'OBC', value: 'OBC' },
        { label: 'SC', value: 'SC' },
        { label: 'ST', value: 'ST' },
        { label: 'VJ / DT', value: 'VJ' },
        { label: 'NT1', value: 'NT1' },
        { label: 'NT2', value: 'NT2' },
        { label: 'NT3', value: 'NT3' },
        { label: 'EWS', value: 'EWS' },
        { label: 'TFWS', value: 'TFWS' }
    ];

    const regions = [
        { label: 'All Regions', value: 'All Regions' },
        { label: 'Western Maharashtra (Pune/Kolhapur)', value: 'Western Maharashtra' },
        { label: 'Konkan (Mumbai/Thane/Ratnagiri)', value: 'Konkan' },
        { label: 'Vidarbha (Nagpur/Amravati)', value: 'Vidarbha' },
        { label: 'Marathwada (Aurangabad/Nanded)', value: 'Marathwada' },
        { label: 'Khandesh (Nashik/Jalgaon)', value: 'Khandesh' }
    ];

    return (
        <section className="form-section glass">
            <h2>Enter Your Scores</h2>
            <form onSubmit={onPredict} className="predictor-form">
                <div className="form-grid">
                    <div className="input-field">
                        <label>MHT-CET Percentile</label>
                        <input
                            type="number"
                            step="0.0000001"
                            max="100"
                            min="0"
                            placeholder="e.g. 98.4523"
                            value={formData.percentile}
                            onChange={(e) => setFormData({ ...formData, percentile: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-field">
                        <label>Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                        </select>
                    </div>

                    <div className="input-field">
                        <label>Preferred Branch (Optional)</label>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <select
                                value={formData.preferredBranch}
                                onChange={(e) => setFormData({ ...formData, preferredBranch: e.target.value })}
                                disabled={branchLoading}
                                style={{ width: '100%' }}
                            >
                                <option value="All Branches">All Branches</option>
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            {fetchError && (
                                <button 
                                    type="button" 
                                    onClick={fetchBranches}
                                    style={{
                                        position: 'absolute',
                                        right: '-30px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        color: '#ff4d4d'
                                    }}
                                    title="Retry fetching branches"
                                >
                                    🔄
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="input-field">
                        <label>Region Filter</label>
                        <select
                            value={formData.region}
                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        >
                            {regions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? (
                        <>
                            <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            Predict Colleges
                        </>
                    )}
                </button>
            </form>
        </section>
    );
};

export default PredictorForm;
