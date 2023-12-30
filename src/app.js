import "dotenv/config";
import express from "express";
import { InteractionType } from "discord-interactions";
import { VerifyDiscordRequest, PromptOpenAI } from "./utils.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.post("/interactions", async function (req, res) {
  // Interaction type and data
  const { type, data, token: interactionToken } = req.body;

  // Just for verification that is required when setting endpoint URL
  if (type === InteractionType.PING) {
    return res.send({ type: 1 });
  }

  // For slash commands
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    if (name === "chat") {
      const { options } = data;
      // Should never happen but just in case
      if (options.length < 1 || !options[0]?.value) {
        return res.send({
          type: 4,
          data: {
            content: "Something fucked up, no prompt found...",
          },
        });
      }

      const asyncResponse = async (prompt) => {
        // Hit OpenAI
        const openaiRes = await PromptOpenAI(prompt, "text");

        await fetch(
          `https://discord.com/api/v8/webhooks/${process.env.APP_ID}/${interactionToken}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: openaiRes.message,
            }),
          }
        );
      };

      asyncResponse(options[0].value);

      // Acknowledge the request
      return res.send({
        type: 5,
      });
    }

    if (name === "image") {
      const { options } = data;
      // Should never happen but just in case
      if (options.length < 1 || !options[0]?.value) {
        return res.send({
          type: 4,
          data: {
            content: "Something fucked up, no prompt found...",
          },
        });
      }

      const asyncResponse = async (prompt, size) => {
        // Hit OpenAI
        const openaiRes = await PromptOpenAI(prompt, "image", size);

        await fetch(
          `https://discord.com/api/v8/webhooks/${process.env.APP_ID}/${interactionToken}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: openaiRes.message,
            }),
          }
        );
      };

      const size = options.length > 1 ? options[1].value : "1024x1024";

      asyncResponse(options[0].value, size);

      // Acknowledge the request
      return res.send({
        type: 5,
      });
    }
  }
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
