import React, { useState, useEffect } from 'react';
import InputComponent from './InputComponent';
import DimensionResult from './DimensionResult';
import FileUpload from './FileUpload';
import { PDFDocument } from 'pdf-lib';

const colorRolls = [
    { size: 1524, price: 830 },
    { size: 1066, price: 575 },
    { size: 914, price: 500 },
    { size: 750, price: 450 },
    { size: 650, price: 400 },
    { size: 450, price: 280 },
];

const bandwRolls = [
    { size: 914, price: 230 },
    { size: 841, price: 220 },
    { size: 650, price: 200 },
    { size: 450, price: 160 },
    { size: 320, price: 130 },
];

const App = () => {
    const [result, setResult] = useState('');
    const [costCalculation, setCostCalculation] = useState('');
    const [pageSizes, setPageSizes] = useState([]);
    const [rollCalculations, setRollCalculations] = useState([]);
    const [totalCost, setTotalCost] = useState(0);
    const [currentRolls, setCurrentRolls] = useState(colorRolls);
    const [bgColor, setBgColor] = useState('bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500');
    const [buttonText, setButtonText] = useState('Switch to B&W Rolls');
    const [showDetails, setShowDetails] = useState(true);

    useEffect(() => {
        const storedRolls = localStorage.getItem('currentRolls');
        if (storedRolls) {
            const parsedRolls = JSON.parse(storedRolls);
            setCurrentRolls(parsedRolls);
            setBgColor(parsedRolls === colorRolls ? 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500' : 'bg-gradient-to-r from-gray-400 via-gray-600 to-gray-800');
            setButtonText(parsedRolls === colorRolls ? 'Switch to B&W Rolls' : 'Switch to Color Rolls');
        }
    }, []);

    const findClosestHigherRoll = (height) => {
        const higherRolls = currentRolls.filter(roll => roll.size >= height);
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

    const handleFileUpload = async (file) => {
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
            return `${rollGroups[price].toFixed(2)} x ${price} = ${(rollGroups[price] * price).toFixed(2)}din`;
        });

        setRollCalculations([...calculations, ...rollSummary]);
        setTotalCost(Object.keys(rollGroups).reduce((acc, price) => acc + rollGroups[price] * price, 0));
    };

    const toggleRolls = () => {
        if (currentRolls === colorRolls) {
            setCurrentRolls(bandwRolls);
            setBgColor('bg-gradient-to-r from-gray-400 via-gray-600 to-gray-800');
            setButtonText('Switch to Color Rolls');
            localStorage.setItem('currentRolls', JSON.stringify(bandwRolls));
        } else {
            setCurrentRolls(colorRolls);
            setBgColor('bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500');
            setButtonText('Switch to B&W Rolls');
            localStorage.setItem('currentRolls', JSON.stringify(colorRolls));
        }
        setTotalCost(0);
    };

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    return (
        <div className={`flex flex-col items-center justify-center min-h-screen ${bgColor} p-6`}>
            <h1 className="text-3xl font-bold mb-4 text-center text-white">Roll Size Calculator</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl">
                <div className="flex flex-col items-center p-4 bg-gray-200 rounded-lg shadow-md">
                    <InputComponent onDimensionSubmit={handleDimensionSubmit} />
                    <DimensionResult result={result} costCalculation={costCalculation} />
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-200 rounded-lg shadow-md">
                    <FileUpload
                        onFileUpload={handleFileUpload}
                        pageSizes={pageSizes}
                        onCalculateRolls={calculateRollsForAllPages}
                        rollCalculations={rollCalculations}
                        totalCost={totalCost}
                        showDetails={showDetails}
                        toggleDetails={toggleDetails}
                    />
                </div>
            </div>
            <div className="flex flex-col items-center mt-4">
                <button
                    onClick={toggleRolls}
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition mt-4"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export default App;
