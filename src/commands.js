import "dotenv/config";
import { InstallGlobalCommands } from "./utils.js";

const CHAT_COMMAND = {
  name: "chat",
  description: "Chat with C-3GPT",
  options: [
    {
      type: 3,
      name: "message",
      description: "Message for C-3PT",
      required: true,
    },
  ],
  type: 1,
};

const IMAGE_COMMAND = {
  name: "image",
  description: "Create an image with C-3GPT",
  options: [
    {
      type: 3,
      name: "prompt",
      description: "Prompt for C-3PT image",
      required: true,
    },
    {
      type: 3,
      name: "size",
      description: "Image resolution size",
      choices: [
        {
          name: "1024x1024",
          value: "1024x1024",
        },
        { name: "1792x1024", value: "1792x1024" },
        {
          name: "1024x1792",
          value: "1024x1792",
        },
      ],
    },
  ],
  type: 1,
};

const ALL_COMMANDS = [CHAT_COMMAND, IMAGE_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
