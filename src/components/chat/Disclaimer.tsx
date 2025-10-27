import { motion, AnimatePresence } from 'framer-motion';

interface DisclaimerProps {
    isInitial: boolean;
}

export function Disclaimer({ isInitial }: DisclaimerProps) {
    return (
        <AnimatePresence>
            {!isInitial && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-zinc-500 mb-4"
                >
                    This AI can make mistakes
                </motion.p>
            )}
        </AnimatePresence>
    );
}