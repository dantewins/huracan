"use client"

import * as React from "react";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ScrollArea } from "@/components/chat/ScrollArea";
import { MessageList } from "@/components/chat/MessageList";
import { SendingIndicator } from "@/components/chat/SendingIndicator";
import { InputGroupWrapper } from "@/components/chat/InputGroupWrapper";
import { InputGroup } from "@/components/chat/InputGroup";
import { Disclaimer } from "@/components/chat/Disclaimer";
import { ImageModal } from "@/components/chat/ImageModal";
import { Message, ImageItem } from "@/types/message";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface LocalMessage extends Message {
  pending?: boolean;
  error?: string;
  tempId?: string;
}

export default function SlugPage() {
  const { user, loading: authLoading, openSignup } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const idFromUrl = pathname.split("/").pop() || null;
  const [messages, setMessages] = React.useState<LocalMessage[]>([]);
  const [value, setValue] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [isThinking, setIsThinking] = React.useState(false);
  const [images, setImages] = React.useState<ImageItem[]>([]);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const [inspectionId, setInspectionId] = React.useState<string | null>(idFromUrl);

  const isInitial = messages.length === 0;
  const effectiveInitial = authLoading || (isInitial && !inspectionId);

  React.useEffect(() => {
    const handlePopstate = () => {
      const newPath = window.location.pathname;
      const newId = newPath.split('/').pop();
      if (newPath.startsWith('/c/') && newId) {
        setInspectionId(newId);
        fetchMessages(newId);
      } else {
        setInspectionId(null);
        setMessages([]);
        setValue("");
        setImages([]);
      }
    };

    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, []);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !user && inspectionId) {
      router.push('/');
      openSignup();
    }
  }, [authLoading, user, inspectionId, router]);

  // Redirect if no inspectionId
  React.useEffect(() => {
    if (!authLoading && inspectionId === null) {
      toast.error("Invalid chat URL");
      router.push('/');
    }
  }, [authLoading, inspectionId, router]);

  // Fetch messages if inspectionId and user are available
  React.useEffect(() => {
    if (inspectionId && user) {
      fetchMessages(inspectionId);
    }
  }, [user, inspectionId]);

  const fetchMessages = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/messages?inspectionId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      } else {
        toast.error(`No chat with that inspection id found`);
        router.push('/');
      }
    } catch (error) {
      toast.error("Error loading messages");
      router.push('/');
    }
  };

  const handleSend = async () => {
    if (!user) {
      openSignup();
      return;
    }
    if (value.trim() === "" && images.length === 0 || isSending || authLoading) return;

    const tempId = uuidv4();
    const imageUrls = images
      .filter((item) => !item.isUploading && !item.error)
      .map((item) => item.previewUrl);

    const optimisticMessage: LocalMessage = {
      id: tempId,
      tempId,
      role: "user",
      content: value,
      images: imageUrls,
      createdAt: new Date(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setValue("");
    setImages([]);
    setIsSending(true);

    let currentId = inspectionId;

    try {
      const res = await fetch(`/api/chat/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inspectionId: currentId,
          role: "user",
          content: value,
          images: imageUrls,
        }),
      });

      if (res.ok) {
        const newUserMessage = await res.json();
        // Update the optimistic message with real data
        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId ? { ...newUserMessage, pending: false } : msg
          )
        );

        setIsThinking(true);

        const promptRes = await fetch('/api/chat/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inspectionId: currentId }),
        });

        if (promptRes.ok) {
          const { content: aiContent } = await promptRes.json();

          const aiRes = await fetch(`/api/chat/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inspectionId: currentId, role: 'assistant', content: aiContent, images: [] }),
          });

          if (aiRes.ok) {
            const newAiMessage = await aiRes.json();
            setMessages((prev) => [...prev, newAiMessage]);
          } else {
            throw new Error('Failed to save AI response');
          }
        } else {
          throw new Error('Failed to generate AI response');
        }
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...msg, pending: false, error: error.message } : msg
        )
      );
      toast.error(error.message || "Error sending message");
    } finally {
      setIsSending(false);
      setIsThinking(false);
    }
  };

  return (
    <ChatContainer isInitial={effectiveInitial}>
      <ScrollArea
        isInitial={effectiveInitial}
        messages={authLoading ? [] : messages}
        setIsAtBottom={setIsAtBottom}
      >
        {!authLoading && (
          <>
            <MessageList
              messages={messages}
              setSelectedImage={setSelectedImage}
            />
            <SendingIndicator isSending={isThinking} />
          </>
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