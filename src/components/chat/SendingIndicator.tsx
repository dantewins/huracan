interface SendingIndicatorProps {
    isSending: boolean;
}

export function SendingIndicator({ isSending }: SendingIndicatorProps) {
    return (
        <>
            {isSending && (
                <div className="mb-6 flex justify-start">
                    <div className="text-zinc-900">Thinking...</div>
                </div>
            )}
        </>
    );
}