import React from 'react';
import { IconArrowUp, IconPlus, IconSquareFilled } from "@tabler/icons-react";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from "@/context/AuthContext";

interface ImageItem {
    previewUrl: string;
    isUploading: boolean;
    error?: string;
}

interface InputGroupProps {
    value: string;
    setValue: (value: string) => void;
    images: ImageItem[];
    setImages: React.Dispatch<React.SetStateAction<ImageItem[]>>;
    handleSend: () => void;
    isSending: boolean;
    setSelectedImage: (url: string | null) => void;
    isAtBottom?: boolean;
}

async function uploadToImgBB(file: File): Promise<string> {
    const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!IMGBB_API_KEY) {
        throw new Error('ImgBB API key is missing');
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);

    const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
        throw new Error('Upload failed: Invalid response');
    }

    return data.data.url;
}

export function InputGroup({
    value,
    setValue,
    images,
    setImages,
    handleSend,
    isSending,
    setSelectedImage,
    isAtBottom = true,
}: InputGroupProps) {
    const [count, setCount] = React.useState(0);
    const [showLeftFade, setShowLeftFade] = React.useState(false);
    const [showRightFade, setShowRightFade] = React.useState(false);

    const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const imagesContainerRef = React.useRef<HTMLDivElement | null>(null);

    const { loading: authLoading } = useAuth();

    const MIN_HEIGHT = 36;
    const MAX_HEIGHT = 240;
    const MAX_IMAGES = 10;
    const MAX_FILE_SIZE_MB = 32;
    const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024; // Bytes
    const limit = 8000;

    React.useEffect(() => {
        setCount(value.length);
    }, [value]);

    React.useLayoutEffect(() => {
        const el = textAreaRef.current;
        if (!el) return;

        el.style.height = "auto";
        const scrollH = el.scrollHeight;
        const next = Math.max(MIN_HEIGHT, Math.min(scrollH, MAX_HEIGHT));
        el.style.height = `${next}px`;
        el.style.overflowY = scrollH > MAX_HEIGHT ? "auto" : "hidden";
    }, [value]);

    React.useEffect(() => {
        const updateFades = () => {
            const el = imagesContainerRef.current;
            if (!el) return;
            const { scrollLeft, scrollWidth, clientWidth } = el;
            setShowLeftFade(scrollLeft > 0);
            setShowRightFade(scrollLeft + clientWidth < scrollWidth - 1); // -1 for floating point precision
        };

        const el = imagesContainerRef.current;
        if (el) {
            el.addEventListener('scroll', updateFades);
            updateFades(); // initial
        }

        return () => el?.removeEventListener('scroll', updateFades);
    }, [images]);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files);
        const validImages = selectedFiles.filter(file =>
            file.type.startsWith("image/") &&
            file.type !== "image/gif" &&
            file.size <= MAX_FILE_SIZE
        );
        const invalidSizeCount = selectedFiles.filter(file => file.size > MAX_FILE_SIZE).length;
        const invalidCount = selectedFiles.length - validImages.length - invalidSizeCount;
        const remaining = MAX_IMAGES - images.length;
        const toAdd = validImages.slice(0, remaining);

        // Create preview items and add to state
        const newItems: ImageItem[] = toAdd.map(file => ({
            previewUrl: URL.createObjectURL(file),
            isUploading: true,
        }));
        setImages((prev) => [...prev, ...newItems]);

        // Upload each in parallel
        toAdd.forEach((file, addIndex) => {
            const item = newItems[addIndex];
            uploadToImgBB(file)
                .then((uploadedUrl) => {
                    setImages((prev) =>
                        prev.map((p) =>
                            p === item
                                ? { previewUrl: uploadedUrl, isUploading: false }
                                : p
                        )
                    );
                    URL.revokeObjectURL(item.previewUrl);
                })
                .catch((error) => {
                    setImages((prev) =>
                        prev.map((p) =>
                            p === item
                                ? { ...p, isUploading: false, error: error.message }
                                : p
                        )
                    );
                    toast.error(`Failed to upload ${file.name}: ${error.message}`);
                });
        });

        if (validImages.length > remaining) {
            toast.error(`Only ${remaining} image${remaining === 1 ? '' : 's'} added as the maximum limit is ${MAX_IMAGES}.`);
        }
        if (invalidCount > 0) {
            toast.error(`${invalidCount} invalid file${invalidCount === 1 ? '' : 's'} (GIFs or non-images) not added.`);
        }
        if (invalidSizeCount > 0) {
            toast.error(`${invalidSizeCount} file${invalidSizeCount === 1 ? '' : 's'} exceed ${MAX_FILE_SIZE_MB} MB limit and not added.`);
        }
        e.target.value = "";
    };

    const removeImage = (index: number) => {
        setImages((prev) => {
            const item = prev[index];
            if (item && item.previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(item.previewUrl);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const hasUploadingImages = images.some((item) => item.isUploading);

    return (
        <div className="relative group p-px bg-gradient-to-r from-sky-500/40 via-blue-500/40 to-fuchsia-500/40">
            <div className="absolute inset-0 blur-xl opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-fuchsia-500/20" />
            <div className={`relative bg-white backdrop-blur-xl ring-1 ring-black/10 shadow-lg ${!isAtBottom ? 'shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.1)]' : ''}`}>
                {images.length > 0 && (
                    <div className="relative px-5 pt-4 overflow-hidden">
                        <div
                            ref={imagesContainerRef}
                            className="flex flex-nowrap gap-2 overflow-x-auto ![&::-webkit-scrollbar]:hidden ![-ms-overflow-style:none] ![scrollbar-width:none]"
                        >
                            {images.map((item, idx) => (
                                <div key={idx} className="relative flex-shrink-0">
                                    {item.isUploading ? (
                                        <div className="relative h-16 w-16">
                                            <img
                                                src={item.previewUrl}
                                                alt={`uploading ${idx + 1}`}
                                                className="h-16 w-16 object-cover rounded-lg"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Spinner className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <img
                                            src={item.previewUrl}
                                            alt={`upload ${idx + 1}`}
                                            className={`h-16 w-16 object-cover rounded-lg cursor-pointer ${item.error ? 'border-2 border-red-500' : ''}`}
                                            onClick={() => setSelectedImage(item.previewUrl)}
                                        />
                                    )}
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-0.5 right-0.5 bg-white p-0.5 rounded-full text-black hover:bg-gray-200 hover:cursor-pointer"
                                    >
                                        <XIcon className="!h-3 !w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className={`absolute top-4 left-5 w-8 h-16 bg-gradient-to-r from-white to-transparent pointer-events-none transition-opacity duration-300 ${showLeftFade ? 'opacity-100' : 'opacity-0'}`} />
                        <div className={`absolute top-4 right-5 w-8 h-16 bg-gradient-to-l from-white to-transparent pointer-events-none transition-opacity duration-300 ${showRightFade ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                )}
                <div className="relative">
                    <textarea
                        ref={textAreaRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything"
                        className={[
                            "w-full pt-4 pb-2 px-5 rounded-[1rem]",
                            "resize-none bg-transparent border-0 outline-none shadow-none",
                            "text-base text-zinc-900 placeholder-zinc-500 leading-6",
                            "transition-[height] duration-150 ease-out will-change-[height]",
                            "shadow-[inset_0_1px_0_0_rgba(0,0,0,0.04)]",
                        ].join(" ")}
                        style={{
                            maxHeight: MAX_HEIGHT,
                        }}
                    />
                </div>
                <div className="flex items-center justify-between px-5 pb-4 pt-1">
                    <button
                        type="button"
                        aria-label="New"
                        className="relative -m-2 p-2 h-9 w-9 flex items-center justify-center hover:bg-gray-100 hover:cursor-pointer"
                        onClick={() => {
                            if (images.length < MAX_IMAGES) fileInputRef.current?.click();
                        }}
                    >
                        <IconPlus className="!h-5 !w-5 text-black" />
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        ref={fileInputRef}
                        onChange={handleUpload}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={isSending || authLoading || hasUploadingImages}
                        className={`h-9 w-9 inline-flex items-center justify-center ${isSending ? 'bg-gray-200' : 'bg-black'} hover:cursor-pointer`}
                    >
                        {authLoading ? (
                            <Spinner className="h-5 w-5 text-white" />
                        ) : isSending ? (
                            <IconSquareFilled className="!h-4 !w-4 text-black" />
                        ) : (
                            <IconArrowUp className="!h-5 !w-5 text-white" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}