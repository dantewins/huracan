import { motion, AnimatePresence } from 'framer-motion';

interface InitialPromptProps {
    isInitial: boolean;
}

export function InitialPrompt({ isInitial }: InitialPromptProps) {
    return (
        <AnimatePresence>
            {isInitial && (
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-3xl text-center mb-10"
                >
                    Where should we begin?
                </motion.h1>
            )}
        </AnimatePresence>
    );
}