import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

const PDFUploader = () => {
    const [pageSizes, setPageSizes] = useState([]);

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
        } else {
            alert('Please upload a valid PDF file.');
        }
    };

    return (
        <div className="flex flex-col items-center p-6 bg-gray-900 min-h-screen">
            <h2 className="text-2xl font-bold mb-4 text-center text-white">PDF Page Size Viewer</h2>
            <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="mb-4"
            />
            <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-lg">
                <h3 className="text-lg font-bold mb-2">Page Sizes:</h3>
                {pageSizes.length > 0 ? (
                    <ul>
                        {pageSizes.map((size, index) => (
                            <li key={index} className="mb-1">
                                Page {index + 1}: {size.width} mm x {size.height} mm
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No pages found or no PDF uploaded.</p>
                )}
            </div>
        </div>
    );
};

export default PDFUploader;
