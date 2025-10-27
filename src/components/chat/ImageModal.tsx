import { XIcon } from "lucide-react";

interface ImageModalProps {
    selectedImage: string | null;
    setSelectedImage: (url: string | null) => void;
}

export function ImageModal({ selectedImage, setSelectedImage }: ImageModalProps) {
    return (
        <>
            {selectedImage && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
                    <img
                        src={selectedImage}
                        alt="enlarged"
                        className="max-h-[90vh] max-w-[90vw] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="fixed top-4 right-4 text-white p-1 rounded-full hover:cursor-pointer"
                    >
                        <XIcon />
                    </button>
                </div>
            )}
        </>
    );
}