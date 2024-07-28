import React, { useState } from 'react';

const InputComponent = ({ onDimensionSubmit }) => {
    const [dimension, setDimension] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onDimensionSubmit(dimension);
        setDimension('');
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4 flex space-x-4">
            <input
                type="text"
                value={dimension}
                onChange={(e) => setDimension(e.target.value)}
                placeholder="Enter dimensions..."
                className="text-center border border-gray-300 p-2 rounded-lg flex-grow"
            />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition">
                Submit
            </button>
        </form>
    );
};

export default InputComponent;
