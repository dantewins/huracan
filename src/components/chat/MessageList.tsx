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

    // Define shared Markdown components to reuse across renders
    const markdownComponents = {
        h1: ({node, ...props}: any) => <h1 className="text-3xl font-bold mt-4 mb-2" {...props} />,
        h2: ({node, ...props}: any) => <h2 className="text-2xl font-bold mt-3 mb-1" {...props} />,
        h3: ({node, ...props}: any) => <h3 className="text-xl font-bold mt-2 mb-1" {...props} />,
        p: ({node, ...props}: any) => <p className="mb-2" {...props} />,
        ul: ({node, ...props}: any) => <ul className="list-disc pl-4 mb-2" {...props} />,
        ol: ({node, ...props}: any) => <ol className="list-decimal pl-4 mb-2" {...props} />,
        li: ({node, ...props}: any) => <li className="mb-1" {...props} />,
        strong: ({node, ...props}: any) => <strong className="font-bold" {...props} />,
        em: ({node, ...props}: any) => <em className="italic" {...props} />,
        code: ({node, ...props}: any) => <code className="bg-gray-100 px-1 py-0.5 rounded" {...props} />,
        pre: ({node, ...props}: any) => <pre className="bg-gray-100 p-2 rounded overflow-auto my-2" {...props} />,
        hr: ({node, ...props}: any) => <hr className="my-4 border-t border-gray-300" {...props} />,
    };

    // Inline version where p is rendered as span to avoid block-level styling
    const inlineMarkdownComponents = {
        ...markdownComponents,
        p: ({node, ...props}: any) => <span {...props} />,
    };

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
                                {intro && <ReactMarkdown components={markdownComponents}>
                                    {intro}
                                </ReactMarkdown>}
                                <div className="space-y-4 mt-4">
                                    {solutions.map((s, i) => (
                                        <div key={i} className="border border-gray-300 p-4 bg-gray-50">
                                            <ReactMarkdown
                                                components={{
                                                    ...markdownComponents, // Spread first
                                                    p: ({node, ...props}: any) => <h3 className="text-lg font-semibold mb-2" {...props} />, // Then override
                                                }}
                                            >
                                                {s.title}
                                            </ReactMarkdown>
                                            <p className="text-sm text-gray-600 mb-1">
                                                Priority: <span className={`${s.priority === 'high' ? 'text-red-500' : s.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'} capitalize`}>{s.priority}</span>
                                            </p>
                                            <ReactMarkdown components={markdownComponents}>
                                                {s.description}
                                            </ReactMarkdown>
                                            {s.estimated_cost && (
                                                <p className="text-sm mb-1">
                                                    <strong>Estimated Cost:</strong>{' '}
                                                    <ReactMarkdown components={inlineMarkdownComponents}>
                                                        {s.estimated_cost}
                                                    </ReactMarkdown>
                                                </p>
                                            )}
                                            {s.estimated_time && (
                                                <p className="text-sm mb-1">
                                                    <strong>Estimated Time:</strong>{' '}
                                                    <ReactMarkdown components={inlineMarkdownComponents}>
                                                        {s.estimated_time}
                                                    </ReactMarkdown>
                                                </p>
                                            )}
                                            {s.resources_needed.length > 0 && (
                                                <p className="text-sm">
                                                    <strong>Resources Needed:</strong> {s.resources_needed.join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {outro && <ReactMarkdown components={markdownComponents}>
                                    {outro}
                                </ReactMarkdown>}
                            </>
                        );
                    } else {
                        contentElement = <ReactMarkdown components={markdownComponents}>
                            {msg.content}
                        </ReactMarkdown>;
                    }
                } else {
                    contentElement = msg.content; // User messages remain plain text
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