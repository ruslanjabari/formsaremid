"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [formData, setFormData] = useState({
    projectName: "",
    teamMembers: "",
    accomplishments: "",
    aplusProblem: "",
    goals: "",
    rating: "",
  });
  const [currentField, setCurrentField] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [message, setMessage] = useState<{
    text: string;
    type: "info" | "error" | "success";
  }>({
    text: "Ready to record mission report. Proceed with caution.",
    type: "info",
  });
  const [bootSequence, setBootSequence] = useState(0);
  const [terminalHeight, setTerminalHeight] = useState(0);
  const [asciiArt, setAsciiArt] = useState("");
  const [bootText, setBootText] = useState<string[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const [cursorPosition, setCursorPosition] = useState(0);
  const [cursorCoordinates, setCursorCoordinates] = useState({
    top: "0.2rem",
    left: "0",
  });

  const [lastSubmissionDate, setLastSubmissionDate] = useState<Date | null>(
    null
  );
  const [cooldownActive, setCooldownActive] = useState(false);

  const fields = [
    {
      name: "projectName",
      label: "PROJECT NAME",
      type: "text",
      rows: 1,
    },
    {
      name: "teamMembers",
      label: "TEAM MEMBER NAMES",
      type: "text",
      rows: 1,
    },
    {
      name: "accomplishments",
      label: "WHAT DID YOU DO THIS WEEK?",
      type: "textarea",
      rows: 4,
    },
    {
      name: "aplusProblem",
      label: "WHAT IS YOUR A+ PROBLEM?",
      type: "textarea",
      rows: 4,
    },
    {
      name: "goals",
      label: "WHAT ARE YOUR GOALS FOR NEXT WEEK?",
      type: "textarea",
      rows: 4,
    },
    {
      name: "rating",
      label: "OPERATION EFFECTIVENESS RATING [1-5]",
      type: "text",
      rows: 1,
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setBootSequence(1);
      setTerminalHeight(3);
      setBootText(["$ INITIALIZING SECURE CONNECTION..."]);
    }, 500);

    setTimeout(() => {
      setTerminalHeight(10);
      setBootText((prev) => [...prev, "$ ESTABLISHING ENCRYPTED CHANNEL..."]);
    }, 1000);

    setTimeout(() => {
      setTerminalHeight(100);
      setBootText((prev) => [...prev, "$ LOADING MISSION REPORT INTERFACE..."]);
    }, 1800);

    const fullAscii = `   _____  _    _ _____  ______ _____  _______ 
  / ____|| |  | |  __ \\|  ____|  __ \\|__   __|
 | (___  | |__| | |__) | |__  | |__) |  | |   
  \\___ \\ |  __  |  ___/|  __| |  _  /   | |   
  ____) || |  | | |    | |____| | \\ \\   | |   
 |_____/ |_|  |_|_|    |______|_|  \\_\\  |_|   
                                             
 FIELD OPERATIONS REPORT SYSTEM`;

    let asciiIndex = 0;
    setTimeout(() => {
      const asciiInterval = setInterval(() => {
        setAsciiArt(fullAscii.slice(0, asciiIndex));
        asciiIndex++;
        if (asciiIndex > fullAscii.length) {
          clearInterval(asciiInterval);

          setTimeout(() => {
            setBootText((prev) => [
              ...prev,
              "$ SYSTEM READY...",
              "$ ACCESS GRANTED. COMMENCE REPORTING.",
            ]);
            setTimeout(() => setBootSequence(2), 1000);
          }, 300);
        }
      }, 5);
    }, 2300);
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentField]);

  useEffect(() => {
    const lastSubmission = localStorage.getItem("lastReportSubmission");
    if (lastSubmission) {
      const lastDate = new Date(lastSubmission);
      setLastSubmissionDate(lastDate);

      const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
      const now = new Date();
      const timeDiff = now.getTime() - lastDate.getTime();

      if (timeDiff < threeDaysInMs) {
        setCooldownActive(true);
      }
    }
  }, []);

  useEffect(() => {
    const cachedProjectName = localStorage.getItem("cachedProjectName");
    const cachedTeamMembers = localStorage.getItem("cachedTeamMembers");

    if (cachedProjectName || cachedTeamMembers) {
      setFormData((prevData) => ({
        ...prevData,
        projectName: cachedProjectName || "",
        teamMembers: cachedTeamMembers || "",
      }));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (inputRef.current && inputRef.current instanceof HTMLTextAreaElement) {
      inputRef.current.scrollTop = inputRef.current.scrollHeight;
    }
  }, [formData[fields[currentField]?.name as keyof typeof formData]]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (e.target instanceof HTMLTextAreaElement) {
      const cursorPos = e.target.selectionStart || 0;
      setCursorPosition(cursorPos);

      const textBeforeCursor = value.substring(0, cursorPos);
      const lines = textBeforeCursor.split("\n");
      const currentLine = lines.length - 1;
      const positionInCurrentLine = lines[currentLine].length;

      const lineHeight = 1.2;
      const verticalPos = currentLine * lineHeight;

      const charWidth = 0.6;
      const horizontalPos = positionInCurrentLine * charWidth;

      setCursorCoordinates({
        top: `${verticalPos}em`,
        left: `${horizontalPos}em`,
      });
    }
  };

  const goToNextField = () => {
    if (currentField < fields.length - 1) {
      setCurrentField(currentField + 1);
    } else {
      handleSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && fields[currentField].rows === 1) {
      e.preventDefault();
      goToNextField();
    }

    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      goToNextField();
    }

    if (e.key === "Backspace" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (currentField > 0) {
        setCurrentField(currentField - 1);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (cooldownActive) {
      const lastDate = lastSubmissionDate as Date;
      const nextAvailableDate = new Date(
        lastDate.getTime() + 3 * 24 * 60 * 60 * 1000
      );

      setMessage({
        text: `SUBMISSION LOCKED: Next report can be submitted on ${nextAvailableDate.toLocaleDateString()}`,
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      localStorage.setItem("cachedProjectName", formData.projectName);
      localStorage.setItem("cachedTeamMembers", formData.teamMembers);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setMessage({
        text: "Report transmission successful. Field data received.",
        type: "success",
      });

      const now = new Date();
      localStorage.setItem("lastReportSubmission", now.toISOString());
      setLastSubmissionDate(now);
      setCooldownActive(true);

      setFormData((prevData) => ({
        ...prevData,
        accomplishments: "",
        aplusProblem: "",
        goals: "",
        rating: "",
      }));
    } catch (error) {
      setMessage({
        text: "TRANSMISSION ERROR: Report submission failed.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="border border-green-500 border-b-0 bg-green-900 bg-opacity-20 px-4 py-2 font-mono text-green-500 flex justify-between">
          <span>$ MISSION-REPORT</span>
          <span className="text-amber-400">SEC-LEVEL: CLASSIFIED</span>
        </div>

        <div
          className="border border-green-500 bg-black p-4 font-mono transition-all duration-1000 overflow-hidden"
          style={{
            height: bootSequence === 0 ? "3px" : "auto",
            opacity: bootSequence === 0 ? 0.3 : 1,
          }}
          onClick={focusInput}
        >
          {bootSequence < 2 ? (
            <div className="boot-sequence">
              <div className="text-green-500 text-xs">
                {bootText.map((line, index) => (
                  <div key={index} className="mb-1">
                    {line}
                    {index === bootText.length - 1 && (
                      <span
                        className={`inline-block w-2 h-4 bg-green-500 ml-1 ${
                          showCursor ? "opacity-100" : "opacity-0"
                        }`}
                      ></span>
                    )}
                  </div>
                ))}
              </div>
              <pre className="text-green-500 text-xs leading-tight my-2">
                {asciiArt}
              </pre>
              {bootSequence === 1 && asciiArt.length > 300 && (
                <div className="mt-4 flex space-x-1">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 bg-green-500"
                      style={{
                        animationDelay: `${i * 50}ms`,
                        animation: "pulse 0.5s infinite",
                        opacity: Math.random() > 0.3 ? 1 : 0.5,
                      }}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <pre className="text-green-500 text-xs leading-tight mb-4 animate-fadeIn">
                {`   _____  _    _ _____  ______ _____  _______ 
  / ____|| |  | |  __ \\|  ____|  __ \\|__   __|
 | (___  | |__| | |__) | |__  | |__) |  | |   
  \\___ \\ |  __  |  ___/|  __| |  _  /   | |   
  ____) || |  | | |    | |____| | \\ \\   | |   
 |_____/ |_|  |_|_|    |______|_|  \\_\\  |_|   
                                             
 FIELD OPERATIONS REPORT SYSTEM
`}
              </pre>

              <div
                className={`mb-4 p-2 border animate-slideInRight ${
                  message.type === "error"
                    ? "border-red-500 text-red-500"
                    : message.type === "success"
                    ? "border-green-500 text-green-500"
                    : "border-amber-500 text-amber-400"
                }`}
              >
                &gt; {message.text}
              </div>

              <div className="mb-6">
                {fields.map((field, index) => (
                  <div
                    key={field.name}
                    className={`mb-4 ${
                      index === currentField
                        ? "border-l-2 border-green-500 pl-2"
                        : "opacity-50"
                    }`}
                    style={{
                      animation: `fadeSlideIn 0.5s ${0.1 + index * 0.1}s both`,
                      opacity: 0,
                    }}
                  >
                    <div className="text-green-500 mb-2">$ {field.label}:</div>
                    {index === currentField ? (
                      <div className="relative">
                        <textarea
                          ref={inputRef}
                          name={field.name}
                          rows={field.rows}
                          value={formData[field.name as keyof typeof formData]}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          className="w-full bg-black text-green-500 focus:outline-none focus:ring-0 border border-green-500 px-1 py-2 custom-textarea"
                          style={{
                            caretColor: "#22c55e",
                            resize: "vertical",
                          }}
                          disabled={isSubmitting}
                        />
                      </div>
                    ) : (
                      <div className="text-green-300 pl-2">
                        {formData[field.name as keyof typeof formData] ||
                          "[PENDING]"}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div
                className="mb-4 p-2 border border-amber-500 text-amber-400 text-sm"
                style={{
                  animation: `fadeSlideIn 0.5s ${
                    0.1 + fields.length * 0.1
                  }s both`,
                  opacity: 0,
                }}
              >
                <div className="font-bold mb-1">KEYBOARD SHORTCUTS:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <code className="bg-black px-1 border border-amber-500">
                      {navigator.platform.includes("Mac")
                        ? "⌘ + ↵"
                        : "Ctrl + Enter"}
                    </code>{" "}
                    Next field
                  </div>
                  <div>
                    <code className="bg-black px-1 border border-amber-500">
                      {navigator.platform.includes("Mac")
                        ? "⌘ + ⌫"
                        : "Ctrl + Backspace"}
                    </code>{" "}
                    Previous field
                  </div>
                </div>
              </div>

              <div
                className="flex justify-between"
                style={{
                  animation: `fadeSlideIn 0.5s ${
                    0.1 + fields.length * 0.1 + 0.1
                  }s both`,
                  opacity: 0,
                }}
              >
                <button
                  type="button"
                  onClick={goToNextField}
                  disabled={isSubmitting}
                  className={`border border-green-500 py-2 px-4 text-center ${
                    isSubmitting
                      ? "bg-green-900 bg-opacity-20 text-green-700"
                      : "bg-green-900 bg-opacity-30 text-green-500 hover:bg-opacity-50"
                  } transition-all duration-300`}
                >
                  {currentField < fields.length - 1
                    ? "NEXT >>"
                    : "SUBMIT REPORT"}
                </button>

                {currentField > 0 && (
                  <button
                    type="button"
                    onClick={() => setCurrentField(currentField - 1)}
                    disabled={isSubmitting}
                    className="border border-amber-500 py-2 px-4 text-center bg-amber-900 bg-opacity-30 text-amber-500 hover:bg-opacity-50 transition-all duration-300"
                  >
                    {"<< BACK"}
                  </button>
                )}
              </div>

              {isSubmitting && (
                <div className="animate-pulse text-amber-400 text-sm mt-4">
                  <div>{"> Encrypting data packets..."}</div>
                  <div>{"> Establishing secure channel..."}</div>
                  <div>{"> Transmitting field report..."}</div>
                  <div className="flex mt-2">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 bg-amber-400 mx-0.5"
                        style={{
                          animationDelay: `${i * 100}ms`,
                          opacity: Math.random() > 0.5 ? 1 : 0.5,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              )}

              {cooldownActive && (
                <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-300 p-4 my-6 rounded-sm">
                  <div className="flex items-center py-1">
                    <svg
                      className="w-6 h-6 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-mono text-lg">
                      SYSTEM COOLING: NEXT REPORT AVAILABLE IN{" "}
                      {lastSubmissionDate &&
                        `${Math.ceil(
                          (new Date(
                            lastSubmissionDate.getTime() +
                              3 * 24 * 60 * 60 * 1000
                          ).getTime() -
                            new Date().getTime()) /
                            (24 * 60 * 60 * 1000)
                        )} DAYS`}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.3;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes blink {
          from,
          to {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        .custom-textarea {
          &::-webkit-scrollbar {
            width: 8px;
            background-color: #000;
          }

          &::-webkit-scrollbar-track {
            background-color: #000;
            border: 1px solid #22c55e;
          }

          &::-webkit-scrollbar-thumb {
            background-color: #22c55e;
            border: 1px solid #22c55e;
          }

          scrollbar-width: thin;
          scrollbar-color: #22c55e #000;

          &::-webkit-resizer {
            background-color: #000;
            border-right: 2px solid #22c55e;
            border-bottom: 2px solid #22c55e;
          }
        }

        .custom-textarea-container {
          position: relative;
        }

        @media screen and (-ms-high-contrast: active),
          (-ms-high-contrast: none) {
          .custom-textarea {
            scrollbar-face-color: #22c55e;
            scrollbar-track-color: #000;
            scrollbar-arrow-color: #22c55e;
          }
        }

        .custom-textarea {
          outline: 1px solid #22c55e;
          outline-offset: -1px;
        }

        .cursor-container {
          overflow: hidden;
          position: relative;
        }

        .custom-textarea {
          display: block;
        }
      `}</style>
    </div>
  );
}
