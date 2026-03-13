import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import PredictorForm from './components/PredictorForm';
import ResultsTable from './components/ResultsTable';
import Loader from './components/Loader';
import { predictColleges } from './services/api';

const App = () => {
  const [formData, setFormData] = useState({
    percentile: '',
    category: '',
    region: 'All Regions',
    preferredBranch: 'All Branches'
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async (e) => {
    e.preventDefault();
    if (formData.percentile < 0 || formData.percentile > 100) {
      setError("Please enter a valid percentile between 0 and 100.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await predictColleges(formData);
      if (response.success) {
        setResults(response.data);
      } else {
        setError(response.message || "Failed to fetch predictions.");
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="logo-section">
          <GraduationCap size={48} className="icon-main" />
          <h1>MHT-CET <span>College Predictor</span></h1>
        </div>
        <p>Predict your engineering future with precision using historical CAP Round data.</p>
      </header>

      <main className="content">
        <PredictorForm
          formData={formData}
          setFormData={setFormData}
          onPredict={handlePredict}
          loading={loading}
        />

        {error && (
          <div className="error-alert glass">
            <p>{error}</p>
          </div>
        )}

        {loading && <Loader />}

        {!loading && results.length > 0 && (
          <ResultsTable results={results} />
        )}

        {!loading && results.length === 0 && formData.percentile && !error && (
          <div className="empty-state glass">
            <p>No colleges found matching your search. Try different criteria or branch.</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2024 <span>MHT-CET Predictor</span>. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
