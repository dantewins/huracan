"use client"

import React from 'react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { ScrollArea } from '@/components/chat/ScrollArea';
import { InitialPrompt } from '@/components/chat/InitialPrompt';
import { MessageList } from '@/components/chat/MessageList';
import { SendingIndicator } from '@/components/chat/SendingIndicator';
import { InputGroupWrapper } from '@/components/chat/InputGroupWrapper';
import { InputGroup } from '@/components/chat/InputGroup';
import { Disclaimer } from '@/components/chat/Disclaimer';
import { ImageModal } from '@/components/chat/ImageModal';
import { Message, ImageItem } from '@/types/message';
import { useAuth } from "@/context/AuthContext";
import { useChats } from '@/context/ChatContext';
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

interface LocalMessage extends Message {
  pending?: boolean;
  error?: string;
  tempId?: string;
}

export default function MainPage() {
  const { user, loading: authLoading, openSignup } = useAuth();
  const { refresh } = useChats();
  const pathname = usePathname();
  const router = useRouter();
  const [messages, setMessages] = React.useState<LocalMessage[]>([]);
  const [value, setValue] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [isThinking, setIsThinking] = React.useState(false);
  const [images, setImages] = React.useState<ImageItem[]>([]);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const [inspectionId, setInspectionId] = React.useState<string | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const isInitial = messages.length === 0;
  const effectiveInitial = authLoading || isInitial;

  React.useEffect(() => {
    const parts = pathname.split('/');
    const idFromUrl = parts[parts.length - 1] || null;
    if (idFromUrl && pathname.startsWith('/c/') && user) {
      setInspectionId(idFromUrl);
      fetchMessages(idFromUrl);
    } else {
      setInspectionId(null);
      setMessages([]);
      setValue("");
      setImages([]);
    }
  }, [user, pathname]);

  const fetchMessages = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/messages?inspectionId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      } else {
        toast.error("Failed to load messages");
      }
    } catch (error) {
      toast.error("Error loading messages");
    }
  };

  const handleSend = async () => {
    if (!user) {
      openSignup();
      return;
    }
    if (value.trim() === "" && images.length === 0 || isSending || authLoading) return;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const tempId = uuidv4();
    const imageUrls = images
      .filter((item) => !item.isUploading && !item.error)
      .map((item) => item.previewUrl);

    const optimisticMessage: LocalMessage = {
      id: tempId,
      tempId,
      role: 'user',
      content: value,
      images: imageUrls,
      createdAt: new Date(),
      pending: true,
    };
    setMessages(prev => [...prev, optimisticMessage]);
    setValue("");
    setImages([]);
    setIsSending(true);

    const wasInitial = !inspectionId;

    let currentId = inspectionId;

    try {
      if (!currentId) {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Chat' }),
          signal,
        });
        if (res.ok) {
          const { id } = await res.json();
          currentId = id;
          refresh();
          setInspectionId(id);
        } else {
          throw new Error('Failed to create inspection');
        }
      }

      const res = await fetch(`/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectionId: currentId, role: 'user', content: value, images: imageUrls }),
        signal,
      });

      if (res.ok) {
        const newUserMessage = await res.json();
        // Update the optimistic message with real data
        setMessages(prev => prev.map(msg =>
          msg.tempId === tempId ? { ...newUserMessage, pending: false } : msg
        ));

        setIsThinking(true);

        const promptRes = await fetch('/api/chat/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inspectionId: currentId }),
          signal,
        });

        if (promptRes.ok) {
          const { content: aiContent } = await promptRes.json();

          const aiRes = await fetch(`/api/chat/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inspectionId: currentId, role: 'assistant', content: aiContent, images: [] }),
            signal,
          });

          if (aiRes.ok) {
            const newAiMessage = await aiRes.json();
            setMessages(prev => [...prev, newAiMessage]);
            if (wasInitial) {
              // Update title with summary after first exchange in the background
              fetch('/api/chat/title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inspectionId: currentId }),
              })
                .then(async (titleRes) => {
                  if (!titleRes.ok) {
                    throw new Error(await titleRes.text());
                  }
                  refresh(); // Refresh to update title in sidebar after successful update
                })
                .catch((error) => {
                  console.error('Failed to update title:', error);
                  toast.error('Failed to update chat title');
                });
            }
          } else {
            throw new Error('Failed to save AI response');
          }
        } else {
          throw new Error('Failed to generate AI response');
        }
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
      } else {
        setMessages(prev => prev.map(msg =>
          msg.tempId === tempId ? { ...msg, pending: false, error: error.message } : msg
        ));
        toast.error(error.message || 'Error sending message');
      }
    } finally {
      setIsSending(false);
      setIsThinking(false);
      abortControllerRef.current = null;
      if (wasInitial && currentId) {
        router.push(`/c/${currentId}`);
      }
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <ChatContainer isInitial={effectiveInitial}>
      <ScrollArea
        isInitial={effectiveInitial}
        messages={authLoading ? [] : messages}
        setIsAtBottom={setIsAtBottom}
      >
        <InitialPrompt isInitial={effectiveInitial} />
        {!authLoading && (
          <>
            <MessageList
              messages={messages}
              setSelectedImage={setSelectedImage}
            />
            <SendingIndicator isSending={isThinking} />
          </>
        )}
        {effectiveInitial && (
          <InputGroupWrapper isInitial={effectiveInitial}>
            <InputGroup
              value={value}
              setValue={setValue}
              images={images}
              setImages={setImages}
              handleSend={handleSend}
              handleCancel={handleCancel}
              isSending={isSending}
              setSelectedImage={setSelectedImage}
              isAtBottom={isAtBottom}
            />
          </InputGroupWrapper>
        )}
      </ScrollArea>
      {!effectiveInitial && (
        <InputGroupWrapper isInitial={effectiveInitial}>
          <InputGroup
            value={value}
            setValue={setValue}
            images={images}
            setImages={setImages}
            handleSend={handleSend}
            handleCancel={handleCancel}
            isSending={isSending}
            setSelectedImage={setSelectedImage}
            isAtBottom={isAtBottom}
          />
        </InputGroupWrapper>
      )}
      <Disclaimer isInitial={effectiveInitial} />
      <ImageModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </ChatContainer>
  );
}