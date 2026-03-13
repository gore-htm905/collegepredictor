import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = "Analyzing Cutoff Data..." }) => {
    return (
        <div className="loader-container">
            <Loader2 size={48} className="spinner" />
            <p>{message}</p>
        </div>
    );
};

export default Loader;
