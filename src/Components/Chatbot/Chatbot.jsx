import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { TypeAnimation } from "react-type-animation";
import ChatbotContainer from "../ChatbotContainer/ChatbotContainer";
import chatData from "../Chats/Data.json";
import sampleChat from "../Chats/ChatSample.json";
import companyChat from "../Chats/CompanyChats.json";
import ChatOptions from "../ChatOptions/ChatOptions";

import "./Style.scss";

// Function to call the ChatGPT API
const callChatGPTAPI = async (userInput) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        messages: [
          {
            role: "system",
            content: "You are a chatbot that can help with various inquiries.",
          },
          { role: "user", content: userInput },
        ],
      },
      {
        headers: {
          Authorization: `Bearer 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`,
        },
      }
    );

    return response.data; // Return the response data
  } catch (error) {
    console.error("Error calling ChatGPT API:", error.message);
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error("Server responded with:", error.response.data);
      console.error("Status code:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received. Check your internet connection.");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up the request:", error.message);
    }
    
    throw error;
  }
};

const Chatbot = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [rememberedInfo, setRememberedInfo] = useState(null);
  const [rememberMode, setRememberMode] = useState(false);
  const [chatOptionsEnabled, setChatOptionsEnabled] = useState(true); // State to track whether chat options are enabled or not
  const chatContainerRef = useRef(null);

  // Optional chatbot
  const handleToggleChatOptions = () => {
    setChatOptionsEnabled(!chatOptionsEnabled); // Toggle the chatOptionsEnabled state
    if (!chatOptionsEnabled) {
      // If chat options are disabled, clear chat messages and user input
      setChatMessages([]);
      setUserInput("");
    }
  };

  // Function to simulate typing effect and AI-like response delay
  const simulateTypingEffect = (message, delay) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(message);
      }, delay);
    });
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    const trimmedInput = userInput.trim();
    if (chatOptionsEnabled) {
      return;
    }
    if (trimmedInput !== "") {
      // Check if the user wants the chatbot to remember something
      if (trimmedInput.toLowerCase().startsWith("remember")) {
        // Enter remembering mode
        setRememberMode(true);
        const rememberResponse = {
          user: false,
          message:
          "Sure, I can remember one thing at a time. Please tell me what you want me to remember:",
        };
        setChatMessages((prevMessages) => [...prevMessages, rememberResponse]);
        setUserInput("");
      } else if (rememberMode) {
        // If the chatbot is in the remembering mode, store the information and exit remembering mode
        const infoToRemember = trimmedInput;
        setRememberedInfo({ text: infoToRemember, timestamp: Date.now() });
        setRememberMode(false);

        // Add a response indicating that the chatbot has remembered the information
        const rememberResponse = {
          user: false,
          message: `Sure, I will remember: "${infoToRemember}" for the next 5-10 minutes.`,
        };
        setChatMessages((prevMessages) => [...prevMessages, aiMessage]);

        setUserInput("");

        // Provide an AI-like response to the user's input after a delay
        const aiResponse = await simulateTypingEffect(
          "Great! How can I assist you further?",
          800
        );
        const aiMessage = {
          user: false,
          message: aiResponse,
        };

        setChatMessages((prevMessages) => [...prevMessages, aiMessage]);

        setUserInput("");
      } else if (
        trimmedInput.toLowerCase().includes("what did i tell you to remember")
      ) {
        // Check if the user wants to know what they asked the chatbot to remember
        if (rememberedInfo) {
          // If the chatbot is remembering something, provide the remembered information
          const rememberedResponse = {
            user: false,
            message: `You asked me to remember: "${rememberedInfo.text}"`,
          };
          setChatMessages((prevMessages) => [
            ...prevMessages,
            rememberedResponse,
          ]);

          setUserInput("");
        } else {
          // If the chatbot is not remembering anything, inform the user
          const noMemoryResponse = {
            user: false,
            message: "I don't have anything to remember at the moment.",
          };
          setChatMessages((prevMessages) => [
            ...prevMessages,
            noMemoryResponse,
          ]);

          // Call the ChatGPT API outside of the conditional blocks
          const apiResponse = await callChatGPTAPI(trimmedInput);
        }
      } else {
        // If the user is not asking the chatbot to remember or inquire about the remembered information

        // Create a new message object
        const newMessage = {
          user: true,
          message: trimmedInput,
        };

        // Add the new message to the chat messages
        setChatMessages((prevMessages) => [...prevMessages, newMessage]);

        // Clear the user input
        setUserInput("");

        // Scroll to the bottom of the chat container
        scrollToBottomWithAnimation();

        // Generate chatbot response after a delay
        setTimeout(() => {
          generateChatbotResponse(trimmedInput);
        }, 1500);
      }

      //  For ChatGPT Response
    }
  };

  // Function to handle the selected sub-option and update the chat messages
  const handleChatOptionSelect = (response) => {
    // Create a new message object
    const newMessage = {
      user: false,
      message: response,
    };
    // Add the new message to the chat messages
    setChatMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  // Generate a response from the chatbot
  // ... (previous code)

  const generateChatbotResponse = async (userMessage) => {
    const matchingResponses = filterResponses(userMessage);

    if (matchingResponses.length > 0) {
      // If a matching response is found, create a new message object
      const matchedResponse = matchingResponses[0];
      const newMessage = {
        user: false,
        message: matchedResponse.answer,
      };
      // Add the new message to the chat messages
      setChatMessages((prevMessages) => [...prevMessages, newMessage]);
    } else if (userMessage.toLowerCase().includes("current time")) {
      // If the user asks for the current time, generate a response with the current time
      const currentTime = new Date().toLocaleTimeString();
      const timeResponse = {
        user: false,
        message: `The current time is: ${currentTime}`,
      };

      // Add the time response to the chat messages
      setChatMessages((prevMessages) => [...prevMessages, timeResponse]);
    } else if (userMessage.toLowerCase().includes("current date")) {
      // If the user asks for the current date, generate a response with the current date
      const currentDate = new Date().toLocaleDateString();
      const dateResponse = {
        user: false,
        message: `The current date is: ${currentDate}`,
      };

      // Add the date response to the chat messages
      setChatMessages((prevMessages) => [...prevMessages, dateResponse]);
    } else {
      // If no matching response is found and it's not a current time/date query,
      // handle complex math expressions or provide a default message
      try {
        // Use a custom math parser function to handle complex math expressions
        const result = evaluateMathExpression(userMessage);
        if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
          // If the result is a valid number, create a response with the result
          const formattedResult = parseFloat(result.toFixed(2)); // Show the result with two decimal places
          const mathResponse = {
            user: false,
            message: `The result of ${userMessage} is: ${formattedResult}`,
          };

          // Add the math response to the chat messages
          setChatMessages((prevMessages) => [...prevMessages, mathResponse]);
        } else {
          // If the result is not a valid number (e.g., Infinity, NaN), provide a default message
          const defaultMessage = {
            user: false,
            message:
              "Sorry, the calculation result is not valid or exceeds the limit I can handle.",
          };

          // Add the default message to the chat messages
          setChatMessages((prevMessages) => [...prevMessages, defaultMessage]);
        }
      } catch (error) {
        // If there is an error in evaluating the expression, provide a default message
        const defaultMessage = {
          user: false,
          message:
            "Sorry, but I'm programmed to provide information and assistance related to the stock market and our company, Growth Securities. If you have any queries or need guidance in these areas, please feel free to ask. Otherwise, please type another related word or rephrase your question.",
        };

        // Add the default message to the chat messages
        setChatMessages((prevMessages) => [...prevMessages, defaultMessage]);
      }
    }

    // Simulate typing effect and provide additional AI-like responses after a delay
    const aiResponses = [
      "I'm here to help you!",
      "Sure, I'm ready to assist.",
      "You're doing great! Keep going.",
      "Hmm, let me think...",
      "I'm learning every day to be more helpful!",
      "Great! How can I assist you further?",
      "You got it! I'm here to answer your questions.",
    ];

    const aiResponse = await simulateTypingEffect(
      aiResponses[Math.floor(Math.random() * aiResponses.length)],
      800
    );
    const aiMessage = {
      user: false,
      message: aiResponse,
    };

    setChatMessages((prevMessages) => [...prevMessages, aiMessage]);

    // Check for stock market related interactions and add funny quotes, emojis, or appreciation
    if (
      userMessage.toLowerCase().includes("stock") ||
      userMessage.toLowerCase().includes("market")
    ) {
      const stockResponses = [
        "Stock market is fascinating, isn't it?",
        "Remember, investing is a long-term game.",
        "Invest in knowledge before investing in stocks.",
        "I wish I could invest in humor, it would never go down.",
        "Let's stock up some knowledge!",
        "In the stock market, the only thing that goes up and down is your heartbeat.",
      ];

      const stockResponse = await simulateTypingEffect(
        stockResponses[Math.floor(Math.random() * stockResponses.length)],
        1200
      );
      const stockMessage = {
        user: false,
        message: stockResponse,
      };

      setChatMessages((prevMessages) => [...prevMessages, stockMessage]);
    } else if (
      userMessage.toLowerCase().includes("thank") ||
      userMessage.toLowerCase().includes("appreciate")
    ) {
      const appreciationResponses = [
        "You're welcome! 😊",
        "Glad I could help!",
        "Always here to assist you.",
        "It's my pleasure to be of service.",
        "Thank you for your kind words!",
      ];

      const appreciationResponse = await simulateTypingEffect(
        appreciationResponses[
          Math.floor(Math.random() * appreciationResponses.length)
        ],
        1400
      );
      const appreciationMessage = {
        user: false,
        message: appreciationResponse,
      };

      setChatMessages((prevMessages) => [...prevMessages, appreciationMessage]);
    }

    // Add funny and engaging responses with emojis
    // const emojis = ["😄", "😃", "😆", "🤣", "😂", "😊", "😉", "🙂", "🤗", "😎"];
  //   const funnyResponses = [
  //     "Haha, that's a good one!",
  //     "LOL! You crack me up!",
  //     "You're hilarious! 😄",
  //     "I'm ROFLing right now! 😂",
  //     "Good one! Keep 'em coming!",
  //     "You've got a great sense of humor!",
  //     "Hahaha! I'm rolling on the floor!",
  //     "That's a knee-slapper!",
  //   ];

  //   // const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  //   const randomFunnyResponse =
  //     funnyResponses[Math.floor(Math.random() * funnyResponses.length)];
  //   const funnyMessage = {
  //     user: false,
  //     message: randomFunnyResponse,
  //     // message: `${randomEmoji} ${randomFunnyResponse}`,
  //   };

  //   setChatMessages((prevMessages) => [...prevMessages, funnyMessage]);
  };

  // Helper function to evaluate complex math expressions
  const evaluateMathExpression = (expression) => {
    // Implement your custom math parser here, or use existing libraries like 'math.js'
    // For this example, I'll use the built-in 'eval()' function
    return eval(expression);
  };

  // Filter the responses based on user input
  const filterResponses = (userMessage) => {
    const matchingResponses = [];

    const filterQuery = (query) => {
      const trimmedQuery = query.toLowerCase().trim();
      return trimmedQuery === userMessage.toLowerCase();
    };

    // Filter responses from the chatData
    if (chatData && chatData.responses && Array.isArray(chatData.responses)) {
      chatData.responses.forEach((response) => {
        const queries = response.query
          .toLowerCase()
          .split(",")
          .map((query) => query.trim());

        if (queries.some(filterQuery)) {
          matchingResponses.push(response);
        }
      });
    } else {
      console.error("chatData is missing or not properly formatted.");
    }

    // Filter responses from the sampleChat
    if (
      sampleChat &&
      sampleChat.responses &&
      Array.isArray(sampleChat.responses)
    ) {
      sampleChat.responses.forEach((response) => {
        const queries = response.query
          .toLowerCase()
          .split(",")
          .map((query) => query.trim());

        if (queries.some(filterQuery)) {
          matchingResponses.push(response);
        }
      });
    } else {
      console.error("sampleChat is missing or not properly formatted.");
    }

    // Filter responses from the companyChat
    if (
      companyChat &&
      companyChat.responses &&
      Array.isArray(companyChat.responses)
    ) {
      companyChat.responses.forEach((response) => {
        const queries = response.query
          .toLowerCase()
          .split(",")
          .map((query) => query.trim());

        if (queries.some(filterQuery)) {
          matchingResponses.push(response);
        }
      });
    } else {
      console.error("companyChat is missing or not properly formatted.");
    }

    return matchingResponses;
  };

  // Handler for updating user input
  const handleChangeUserInput = (event) => {
    setUserInput(event.target.value);
  };

  // Scroll to the bottom of the chat container with animation
  const scrollToBottomWithAnimation = () => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Initialize the chat with sample messages
  const initializeChat = () => {
    if (
      sampleChat &&
      sampleChat.messages &&
      Array.isArray(sampleChat.messages)
    ) {
      const initialMessages = sampleChat.messages.map((message) => ({
        user: message.user,
        message: message.message,
      }));
      setChatMessages(initialMessages);
    } else {
      console.error(
        "Sample chat messages are missing or not properly formatted."
      );
    }
  };

  useEffect(() => {
    const clearRememberedInfo = () => {
      setRememberedInfo(null);
      // Optionally, you can add a response indicating that the chatbot has forgotten the information.
      // For example:
      // const forgetResponse = {
      //   user: false,
      //   message: `I have forgotten the information I previously remembered.`,
      // };
      // setChatMessages((prevMessages) => [...prevMessages, forgetResponse]);
    };

    // Set a timer to clear the remembered information after the specified duration (e.g., 5 minutes)
    const timer = setTimeout(clearRememberedInfo, 5 * 60 * 1000); // 5 minutes (in milliseconds)

    // Clean up the timer when the component is unmounted or the rememberedInfo state changes
    return () => clearTimeout(timer);
  }, [rememberedInfo]);

  // Initialize the chat on component mount
  useEffect(() => {
    initializeChat();
  }, []);

  // Scroll to the bottom of the chat container when chat messages change
  useEffect(() => {
    scrollToBottomWithAnimation();
  }, [chatMessages]);

  // Scroll to the bottom of the chat container when the chat container ref changes
  useEffect(() => {
    scrollToBottomWithAnimation();
  }, [chatContainerRef.current]);

  // Render the Chatbot component
  return (
    <>
      <div className="wrapper centerBody">
        <div className="centerBot">
          <div className="typer">
            <TypeAnimation
              sequence={[
                "Welcome to our Growth chatbot! I'm San, your vertual assistant. How can I assist you today? Feel free to ask any questions or seek guidance on your journey! 😊",
              ]}
              wrapper="div"
              cursor={false}
              repeat={true}
              style={{
                color: "#269ed6",
                fontSize: "14px",
              }}
            />
          </div>
          <button onClick={handleToggleChatOptions} className="chatbotOption">
            {chatOptionsEnabled ? (
              <span className="chatbotOptionText animated">
                Enable Typing <i className="fa fa-keyboard-o"></i>
              </span>
            ) : (
              <span className="chatbotOptionText">
                Enable Option <i className="fa fa-gear fa-spin"></i>
              </span>
            )}
          </button>
          <hr width="100%" />
          {chatOptionsEnabled ? (
            <ChatOptions handleChatOptionSelect={handleChatOptionSelect} />
          ) : null}
          <ChatbotContainer
            chatMessages={chatMessages}
            userInput={userInput}
            handleChangeUserInput={handleChangeUserInput}
            handleSendMessage={handleSendMessage}
            chatContainerRef={chatContainerRef}
            chatOptionsEnabled={chatOptionsEnabled}
          />
        </div>
      </div>
    </>
  );
};

export default Chatbot;
