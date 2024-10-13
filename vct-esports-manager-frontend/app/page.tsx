"use client";

import { ChatRequestBody } from "@/types/api";
import { CpuChipIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { UUID } from "crypto";
import {
  ClipboardEventHandler,
  KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { v6 as uuidv6 } from "uuid";

type Message = {
  author: "User" | "AI";
  content: string;
};

const prewrittenPrompts = [
  {
    title: "Professional team",
    prompt:
      "Build a team using only players from VCT International. Assign roles to each player and explain why this composition would be effective in a competitive match.",
  },
  {
    title: "Semi-professional team",
    prompt:
      "Build a team using only players from VCT Challengers. Assign roles to each player and explain why this composition would be effective in a competitive match.",
  },
  {
    title: "Game Changers team",
    prompt:
      "Build a team using only players from VCT Game Changers. Assign roles to each player and explain why this composition would be effective in a competitive match.",
  },
  {
    title: "Mixed-gender team",
    prompt:
      "Build a team that includes at least two players from an underrepresented group, such as the Game Changers program. Define roles and discuss the advantages of this inclusive team structure.",
  },
  {
    title: "Cross-regional team",
    prompt:
      "Build a team with players from at least three different regions. Assign each player a role and explain the benefits of this diverse composition.",
  },
  {
    title: "Rising star team",
    prompt:
      "Build a team that includes at least two semi-professional players, such as from VCT Challengers or VCT Game Changers. Define roles and discuss details of how these players were chosen.",
  },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInFocus, setIsInFocus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uuid, setUuid] = useState<string | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  const submitPrompt = async () => {
    const prompt = inputRef.current!.innerText;

    if (!prompt.trim()) return;

    inputRef.current!.innerHTML = "";

    setMessages((messages) => [
      {
        author: "AI",
        content: "",
      },
      {
        author: "User",
        content: prompt,
      },
      ...messages,
    ]);
    setIsLoading(true);

    let currentUuid;
    if (uuid === null) {
      currentUuid = uuidv6();
      setUuid(currentUuid);
    } else {
      currentUuid = uuid;
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        sessionId: currentUuid,
        inputText: prompt,
      } as ChatRequestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.body) return; // TODO: error handling

    const decoder = new TextDecoder("utf-8");

    // @ts-expect-error for some reason trying to loop over response.body throws error
    for await (const chunk of response.body) {
      const data = decoder.decode(chunk);

      console.log(data);

      setMessages((messages) => [
        {
          author: "AI",
          content: decoder.decode(chunk),
        },
        ...messages.slice(1),
      ]);

      if (!data.includes(`<p class="trace-step">`)) {
        break;
      }
    }

    setIsLoading(false);
  };

  const handleInputKeydown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter") {
      submitPrompt();
    }
    // console.log(e.target.innerText);
    // if ((e.target as HTMLDivElement).innerText === "") {
    //   setInputIsEmpty(true);
    // } else {
    //   setInputIsEmpty(false);
    // }
  };

  const handleInputPaste: ClipboardEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();

    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertHTML", false, text);
  };

  return (
    <main className="container mx-auto pt-5">
      {messages.length === 0 && (
        <div className="text-center mx-auto max-w-xl text-gray-200">
          <h1 className="text-3xl font-bold">VCT Esports Manager</h1>
          <p className="my-2">
            Enter a prompt in the text field to get started, or select one of
            the prompts below:
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-2 justify-center">
            {prewrittenPrompts.map((prompt) => (
              <button
                className="border border-gray-500 text-gray-200 px-3 rounded-full hover:text-gray-400"
                key={prompt.title}
                onClick={() => {
                  inputRef.current!.innerText = prompt.prompt;
                  submitPrompt();
                }}
              >
                {prompt.title}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col-reverse gap-y-5 pb-24 max-w-5xl mx-auto">
        {messages.map((message, i) => (
          <div
            key={i}
            className={clsx(
              "flex gap-x-5 p-3 rounded-2xl",
              message.author === "AI" ? "self-start" : "self-end max-w-[60%]",
              {
                "bg-gray-700": message.author === "User",
              }
            )}
          >
            {message.author === "AI" && <CpuChipIcon className="size-8" />}
            {isLoading && i === 0 && (
              <div className="lds-facebook">
                <div></div>
                <div></div>
                <div></div>
              </div>
            )}
            <div
              className={clsx("whitespace-pre-line flex-1")}
              dangerouslySetInnerHTML={{ __html: message.content }}
            ></div>
          </div>
        ))}
      </div>
      <div className="w-full fixed bottom-0 left-0 right-0 bg-black">
        <div className="px-10 pb-5 relative w-full max-w-5xl mx-auto">
          <div
            className={clsx("bg-gray-800 rounded-2xl pl-5 pr-7 py-2", {
              "after:content-['How_can_I_help_you?'] after:pointer-events-none after:cursor-text after:text-gray-400":
                !isInFocus,
            })}
            contentEditable
            ref={inputRef}
            onKeyDown={handleInputKeydown}
            onPaste={handleInputPaste}
            onFocus={() => setIsInFocus(true)}
            onBlur={() => setIsInFocus(false)}
          ></div>
          <button
            className="absolute right-10 bottom-5 p-2 z-10"
            onClick={submitPrompt}
          >
            <PaperAirplaneIcon className="size-6" />
          </button>
        </div>
      </div>
    </main>
  );
}
