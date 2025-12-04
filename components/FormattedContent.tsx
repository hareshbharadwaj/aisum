import React from 'react';

const FormattedContent: React.FC<{ content: string }> = ({ content }) => {
    const renderLine = (line: string) => {
        const parts = line.split('**');
        return (
            <>
                {parts.map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                )}
            </>
        );
    };

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let paraLines: string[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc pl-6 space-y-2 my-4">
                    {listItems.map((item, index) => <li key={index} className="text-slate-700">{renderLine(item)}</li>)}
                </ul>
            );
            listItems = [];
        }
    };

    const flushPara = () => {
        if (paraLines.length > 0) {
            elements.push(
                <p key={`p-${elements.length}`} className="my-4 text-slate-700 leading-relaxed">
                    {renderLine(paraLines.join(' '))}
                </p>
            );
            paraLines = [];
        }
    };

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('## ')) {
            flushList();
            flushPara();
            elements.push(<h2 key={index} className="text-2xl font-bold mt-6 mb-3 pb-2 border-b border-slate-200 text-slate-800">{renderLine(trimmedLine.substring(3))}</h2>);
        } else if (trimmedLine.startsWith('### ')) {
            flushList();
            flushPara();
            elements.push(<h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-slate-700">{renderLine(trimmedLine.substring(4))}</h3>);
        } else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
            flushPara();
            listItems.push(trimmedLine.substring(2));
        } else if (trimmedLine) {
            flushList();
            paraLines.push(trimmedLine);
        } else {
             flushList();
             flushPara();
        }
    });

    flushList();
    flushPara();

    if (elements.length === 0) {
        return <div className="whitespace-pre-wrap">{content}</div>;
    }

    return <div>{elements}</div>;
};

export default FormattedContent;