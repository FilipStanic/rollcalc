import React, { useState } from 'react';

const FileUpload = ({ onFileUpload, pageSizes, onCalculateRolls, rollCalculations, totalCost }) => {
    const [showDetails, setShowDetails] = useState(true);
    const [fileSelected, setFileSelected] = useState(false);

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    const handleFileChange = (file) => {
        onFileUpload(file);
        setFileSelected(true);
    };

    const filteredCalculations = rollCalculations.filter(calc => 
        typeof calc === 'string' && !calc.startsWith("Page")
    );

    return (
        <div>
            <div className="flex flex-col items-center">
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    className="mb-4 p-2 border border-gray-300 rounded-lg"
                />
                {fileSelected && (
                    <button
                        onClick={onCalculateRolls}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition mt-2"
                    >
                        Calculate Rolls for All Pages
                    </button>
                )}
            </div>
            {pageSizes.length > 0 && (
                <div className="text-black mt-4 text-center">
                    <h2 className="text-xl font-bold mb-4">Roll Calculations:</h2>
                    {showDetails && (
                        <div>
                            {filteredCalculations.map((calc, index) => (
                                <p key={index} className="mb-2 text-m font-bold">
                                    {calc}
                                </p>
                            ))}
                        </div>
                    )}
                    <p className="mt-4 text-3xl font-bold text-black underline">
                        Total Cost: <u>{totalCost.toFixed(2)}</u>din
                    </p>
                    <button
                        onClick={toggleDetails}
                        className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition mt-4"
                    >
                        {showDetails ? 'Hide Details' : 'Show Details'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
