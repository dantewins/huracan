import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '@/types/message';
import { geminiService } from '@/lib/gemini';

interface MessageListProps {
    messages: Message[];
    setSelectedImage: (url: string | null) => void;
}

export function MessageList({ messages, setSelectedImage }: MessageListProps) {
    const { parseSolutions } = geminiService;

    return (
        <>
            {messages.map((msg, index) => {
                const isUser = msg.role === 'user';

                let contentElement;
                let intro;
                if (!isUser) {
                    const solutions = parseSolutions(msg.content);
                    if (solutions.length > 0) {
                        let firstSolutionIndex = msg.content.toLowerCase().indexOf('solution:');
                        if (firstSolutionIndex >= 0) {
                            // Check if preceded by '**'
                            if (firstSolutionIndex >= 2 && msg.content.substring(firstSolutionIndex - 2, firstSolutionIndex) === '**') {
                                firstSolutionIndex -= 2;
                            }
                            intro = msg.content.substring(0, firstSolutionIndex).trim();
                        }
                        
                        const lastResourcesIndex = msg.content.toLowerCase().lastIndexOf('resources:');
                        let outro = '';
                        if (lastResourcesIndex !== -1) {
                            const endOfLine = msg.content.indexOf('\n', lastResourcesIndex);
                            const outroStart = endOfLine !== -1 ? endOfLine + 1 : msg.content.length;
                            outro = msg.content.substring(outroStart).trim();
                        }

                        contentElement = (
                            <>
                                {intro && <ReactMarkdown
                                    components={{
                                        h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-4 mb-2" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-3 mb-1" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-2 mb-1" {...props} />,
                                        p: ({node, ...props}) => <p className="mb-2" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                        em: ({node, ...props}) => <em className="italic" {...props} />,
                                        code: ({node, ...props}) => <code className="bg-gray-100 px-1 py-0.5 rounded" {...props} />,
                                        pre: ({node, ...props}) => <pre className="bg-gray-100 p-2 rounded overflow-auto my-2" {...props} />,
                                        hr: ({node, ...props}) => <hr className="my-4 border-t border-gray-300" {...props} />,
                                    }}
                                >
                                    {intro}
                                </ReactMarkdown>}
                                <div className="space-y-4 mt-4">
                                    {solutions.map((s, i) => (
                                        <div key={i} className="border border-gray-300 p-4 bg-gray-50">
                                            <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                                            <p className="text-sm text-gray-600 mb-1">
                                                Priority: <span className={`${s.priority === 'high' ? 'text-red-500' : s.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'} capitalize`}>{s.priority}</span>
                                            </p>
                                            <p className="mb-2">{s.description}</p>
                                            {s.estimated_cost && <p className="text-sm mb-1"><b>Estimated Cost:</b> {s.estimated_cost}</p>}
                                            {s.estimated_time && <p className="text-sm mb-1"><b>Estimated Time:</b> {s.estimated_time}</p>}
                                            {s.resources_needed.length > 0 && <p className="text-sm"><b>Resources Needed:</b> {s.resources_needed.join(', ')}</p>}
                                        </div>
                                    ))}
                                </div>
                                {outro && <ReactMarkdown
                                    components={{
                                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-3 mb-1" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-2 mb-1" {...props} />,
                                        p: ({node, ...props}) => <p className="mb-2" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                        em: ({node, ...props}) => <em className="italic" {...props} />,
                                        code: ({node, ...props}) => <code className="bg-gray-100 px-1 py-0.5 rounded" {...props} />,
                                        pre: ({node, ...props}) => <pre className="bg-gray-100 p-2 rounded overflow-auto my-2" {...props} />,
                                        hr: ({node, ...props}) => <hr className="my-4 border-t border-gray-300" {...props} />,
                                    }}
                                >
                                    {outro}
                                </ReactMarkdown>}
                            </>
                        );
                    } else {
                        contentElement = <ReactMarkdown
                            components={{
                                h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-3 mb-1" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-2 mb-1" {...props} />,
                                p: ({node, ...props}) => <p className="mb-2" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                em: ({node, ...props}) => <em className="italic" {...props} />,
                                code: ({node, ...props}) => <code className="bg-gray-100 px-1 py-0.5 rounded" {...props} />,
                                pre: ({node, ...props}) => <pre className="bg-gray-100 p-2 rounded overflow-auto my-2" {...props} />,
                                hr: ({node, ...props}) => <hr className="my-4 border-t border-gray-300" {...props} />,
                            }}
                        >
                            {msg.content}
                        </ReactMarkdown>;
                    }
                } else {
                    contentElement = msg.content
                }

                return (
                    <div
                        key={index}
                        className={`mb-6 ${isUser ? "flex justify-end" : "flex justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] ${isUser ? "px-2 py-1 bg-gray-100 text-black" : "text-zinc-900"}`}
                        >
                            {msg.images && msg.images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {msg.images.map((url, idx) => (
                                        <img
                                            key={idx}
                                            src={url}
                                            alt={`image ${idx + 1}`}
                                            className="h-40 w-auto object-cover cursor-pointer"
                                            onClick={() => setSelectedImage(url)}
                                        />
                                    ))}
                                </div>
                            )}
                            {contentElement}
                        </div>
                    </div>
                );
            })}
        </>
    );
}