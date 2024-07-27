import React, { useState } from 'react';
import InputComponent from './InputComponent';
import { PDFDocument } from 'pdf-lib';

const rolls = [
    { size: 1524, price: 830 },
    { size: 1066, price: 575 },
    { size: 914, price: 500 },
    { size: 750, price: 450 },
    { size: 650, price: 400 },
    { size: 450, price: 280 },
];

const App = () => {
    const [result, setResult] = useState('');
    const [costCalculation, setCostCalculation] = useState('');
    const [pageSizes, setPageSizes] = useState([]);
    const [rollCalculations, setRollCalculations] = useState([]);
    const [totalCost, setTotalCost] = useState(0);

    const findClosestHigherRoll = (height) => {
        const higherRolls = rolls.filter(roll => roll.size >= height);
        if (higherRolls.length === 0) {
            return null;
        }
        return higherRolls.reduce((prev, curr) => (curr.size < prev.size ? curr : prev));
    };

    const handleDimensionSubmit = (dimension) => {
        const [first, second] = dimension.split('x').map(Number);
        const height = Math.max(first, second);
        const lowerDimension = Math.min(first, second);

        if (dimension === '841x1180' || dimension === '1180x841') {
            const lowerDimensionDecimal = (1180 / 1000).toFixed(2);
            const totalCost = lowerDimensionDecimal * 500;
            setResult(`For the file dimension ${dimension}, the closest roll is 914mm.`);
            setCostCalculation(`${lowerDimensionDecimal} x 500 = ${totalCost.toFixed(2)}din`);
        } else if (!isNaN(height) && !isNaN(lowerDimension)) {
            const closestRoll = findClosestHigherRoll(height);
            if (closestRoll) {
                const lowerDimensionDecimal = (lowerDimension / 1000).toFixed(2);
                const totalCost = lowerDimensionDecimal * closestRoll.price;
                setResult(`For the file dimension ${dimension}, the closest roll is ${closestRoll.size}mm.`);
                setCostCalculation(`${lowerDimensionDecimal} x ${closestRoll.price} = ${totalCost.toFixed(2)}din`);
            } else {
                setResult(`There are no rolls larger than ${height}mm.`);
                setCostCalculation('');
            }
        } else {
            setResult("Please enter valid dimensions in the format 'width x height'.");
            setCostCalculation('');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();
            const sizes = pages.map(page => {
                const { width, height } = page.getSize();
                return {
                    width: (width * 0.352778).toFixed(2),
                    height: (height * 0.352778).toFixed(2)
                };
            });
            setPageSizes(sizes);
            setRollCalculations([]); // Reset previous calculations
            setTotalCost(0); // Reset total cost to 0 when a new PDF is uploaded
        } else {
            alert('Please upload a valid PDF file.');
        }
    };

    const calculateRollsForAllPages = () => {
        const rollGroups = {};
        const calculations = pageSizes.map(({ width, height }, index) => {
            const dimension = `${width}x${height}`;
            const [first, second] = dimension.split('x').map(Number);
            const heightVal = Math.max(first, second);
            const lowerDimension = Math.min(first, second);

            if (dimension === '841x1180' || dimension === '1180x841') {
                const lowerDimensionDecimal = (1180 / 1000).toFixed(2);
                const totalCost = lowerDimensionDecimal * 500;
                if (!rollGroups[500]) rollGroups[500] = 0;
                rollGroups[500] += parseFloat(lowerDimensionDecimal);
                return `Page ${index + 1}: For the file dimension ${dimension}, the closest roll is 914mm.`;
            } else {
                const closestRoll = findClosestHigherRoll(heightVal);
                if (closestRoll) {
                    const lowerDimensionDecimal = (lowerDimension / 1000).toFixed(2);
                    const totalCost = lowerDimensionDecimal * closestRoll.price;
                    if (!rollGroups[closestRoll.price]) rollGroups[closestRoll.price] = 0;
                    rollGroups[closestRoll.price] += parseFloat(lowerDimensionDecimal);
                    return `Page ${index + 1}: For the file dimension ${dimension}, the closest roll is ${closestRoll.size}mm.`;
                } else {
                    return `Page ${index + 1}: There are no rolls larger than ${heightVal}mm.`;
                }
            }
        });

        const rollSummary = Object.keys(rollGroups).map(price => {
            return (
                <span key={price} className="font-bold text-lg underline">
                    {rollGroups[price].toFixed(2)} x {price} = {(rollGroups[price] * price).toFixed(2)}din
                </span>
            );
        });

        setRollCalculations([...calculations, ...rollSummary]);
        setTotalCost(Object.keys(rollGroups).reduce((acc, price) => acc + rollGroups[price] * price, 0));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
            <h1 className="text-3xl font-bold mb-4 text-center text-white">Roll Size Calculator</h1>
            <div className="flex justify-center w-full max-w-4xl space-x-6">
                <div className="flex flex-col items-center w-1/2 p-4 bg-gray-800 rounded-lg shadow-lg">
                    <InputComponent onDimensionSubmit={handleDimensionSubmit} />
                    {result && (
                        <p className="mt-4 text-lg text-gray-300 border border-gray-600 p-4 rounded-lg bg-gray-700 shadow-md text-center">
                            {result}
                        </p>
                    )}
                    {costCalculation && (
                        <p className="mt-2 text-lg text-gray-300 border border-gray-600 p-4 rounded-lg bg-gray-700 shadow-md text-center">
                            {costCalculation}
                        </p>
                    )}
                </div>
                <div className="flex flex-col items-center w-1/2 p-4 bg-gray-800 rounded-lg shadow-lg">
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        className="mb-4 bg-gray-700 text-gray-300 p-2 rounded-lg"
                    />
                    {pageSizes.length > 0 && (
                        <>
                            <button
                                onClick={calculateRollsForAllPages}
                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition mb-4"
                            >
                                Calculate Rolls for All Pages
                            </button>
                            <div className="bg-gray-700 p-4 rounded-lg shadow-md w-full max-w-lg">
                                <h3 className="text-lg font-bold mb-2 text-white">Page Sizes and Rolls:</h3>
                                {rollCalculations.length > 0 ? (
                                    <ul className="text-gray-300">
                                        {rollCalculations.map((calculation, index) => (
                                            <li key={index} className="mb-1">
                                                {calculation}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-300">No calculations performed yet.</p>
                                )}
                                <p className="mt-4 text-2xl font-bold text-white">
                                    Total Cost: {totalCost.toFixed(2)}din
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
