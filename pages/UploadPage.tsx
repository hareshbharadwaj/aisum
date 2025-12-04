import React, { useState } from 'react';
import { generateSummary } from '../services/geminiService';
import { parseFile } from '../services/fileParserService';
import { useAppContext } from '../contexts/AppContext';
import * as StorageService from '../services/storageService';
import Spinner from '../components/Spinner';
import { UploadIcon } from '../components/Icons';
import FormattedContent from '../components/FormattedContent';

const UploadPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string>('');
    const [isParsing, setIsParsing] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [error, setError] = useState<string>('');
    const [generatedSummary, setGeneratedSummary] = useState<string>('');
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { addSummary, setPage } = useAppContext();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
             const allowedTypes = [
                'text/plain',
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            ];
            // A simple extension check for browser compatibility
            const allowedExtensions = ['.txt', '.pdf', '.xlsx', '.pptx'];
            const fileExtension = '.' + selectedFile.name.split('.').pop();

            if (allowedTypes.includes(selectedFile.type) || allowedExtensions.includes(fileExtension)) {
                setFile(selectedFile);
                setFileContent('');
                setGeneratedSummary('');
                setError('');
                setIsParsing(true);
                try {
                    const content = await parseFile(selectedFile);
                    setFileContent(content);
                } catch (err: any) {
                    setError(err.message || 'Failed to read file content.');
                    setFile(null);
                } finally {
                    setIsParsing(false);
                }
            } else {
                setError('Please upload a valid .txt, .pdf, .xlsx, or .pptx file.');
                setFile(null);
                setFileContent('');
            }
        }
    };

    const handleSummarize = async () => {
        if (!fileContent || !file) return;

        setIsSummarizing(true);
        setError('');
        setGeneratedSummary('');
        try {
            const summary = await generateSummary(fileContent);
            setGeneratedSummary(summary);

            const newSummary = {
                id: new Date().toISOString(),
                title: file.name,
                originalContent: fileContent,
                summaryContent: summary,
                createdAt: new Date().toISOString(),
            };
            await addSummary(newSummary);
            setPage('SUMMARIES');
        } catch (err: any) {
            setError(err.message || 'An error occurred while generating the summary.');
        } finally {
            setIsSummarizing(false);
        }
    };
    
    const getButtonText = () => {
        if (isParsing) return 'Parsing File...';
        if (isSummarizing) return 'Generating Summary...';
        return 'Generate Summary';
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Upload Your Notes</h1>
            <p className="text-lg text-slate-600">Upload lecture notes in .txt, .pdf, .xlsx, or .pptx format.</p>

            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
                <div className="flex flex-col items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadIcon className="w-10 h-10 mb-3 text-slate-400" />
                            <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-slate-500">TXT, PDF, XLSX, PPTX</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".txt,.pdf,.xlsx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation" />
                    </label>
                    {file && <p className="mt-4 text-sm text-slate-700 font-medium">Selected file: {file.name}</p>}
                </div>
                
                {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}

                <div className="mt-6 flex justify-center">
                    <button
                        onClick={handleSummarize}
                        disabled={!fileContent || isParsing || isSummarizing}
                        className="flex items-center justify-center w-full md:w-auto px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300 disabled:cursor-not-allowed"
                    >
                        { (isParsing || isSummarizing) && <Spinner /> }
                        <span className="ml-2">{getButtonText()}</span>
                    </button>
                </div>

                {generatedSummary && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Summary Generated!</h2>
                        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                           <FormattedContent content={generatedSummary} />
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-4">
                            <button onClick={() => setPage('SUMMARIES')} className="text-sky-600 font-medium hover:underline">
                                View all summaries &rarr;
                            </button>
                            <button
                                onClick={async () => {
                                    if (!file) return;
                                    setIsSaving(true);
                                    setIsSaved(false);
                                    try {
                                        const contentJson = { text: fileContent };
                                        await StorageService.saveSummaryToDb(StorageService.getCurrentUser()?.email || 'anonymous', { filename: file.name, mimetype: file.type, size: file.size, contentJson }, file.name, generatedSummary);
                                        setIsSaved(true);
                                    } catch (err: any) {
                                        setIsSaved(false);
                                        setError(err.message || 'Failed to save summary');
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                                disabled={isSaving}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60"
                            >
                                {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save Summary'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadPage;