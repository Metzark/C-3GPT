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

const ALL_COMMANDS = [CHAT_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
