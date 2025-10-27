import { motion } from 'framer-motion';

interface InputGroupWrapperProps {
    isInitial: boolean;
    children: React.ReactNode;
}

export function InputGroupWrapper({ isInitial, children }: InputGroupWrapperProps) {
    return (
        <>
            {isInitial ? (
                <motion.div layoutId="input-group">
                    {children}
                </motion.div>
            ) : (
                <div className="mb-4 px-2">
                    <div className="w-full max-w-3xl mx-auto px-4 xl:px-0">
                        <motion.div layoutId="input-group">
                            {children}
                        </motion.div>
                    </div>
                </div>
            )}
        </>
    );
}