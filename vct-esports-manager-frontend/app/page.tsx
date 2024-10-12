"use client";

import { ChatRequestBody } from "@/types/api";
import { useEffect, useState } from "react";
import { v6 as uuidv6 } from "uuid";

type Message = {
  author: "User" | "AI";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    async function getChatResponse() {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          sessionId: uuidv6(),
          inputText: "hello",
        } as ChatRequestBody),
      });

      if (!response.body) return;

      const decoder = new TextDecoder("utf-8");

      for await (const chunk of response.body) {
        console.log(decoder.decode(chunk));
      }
    }

    getChatResponse();
  }, []);

  return (
    <main className="container mx-auto">
      <div className="max-w-5xl">
        <div>
          {messages.map((message, i) => (
            <div key={i}>
              <p>{message.content}</p>
            </div>
          ))}
        </div>
        <div className="w-full">
          <div
            className="bg-gray-800 rounded-full px-5 py-2 w-full"
            contentEditable
          />
        </div>
      </div>
    </main>
  );
}
