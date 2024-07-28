import React from 'react';

const DimensionResult = ({ result, costCalculation }) => (
    <div className="text-center mb-4">
        <p className="text-lg text-black font-bold mb-2">{result}</p>
        {costCalculation && (
            <p className="text-xl text-black font-bold underline">{costCalculation}</p>
        )}
    </div>
);

export default DimensionResult;
