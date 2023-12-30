import "dotenv/config";
import fetch from "node-fetch";
import { verifyKey } from "discord-interactions";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRET });

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    const signature = req.get("X-Signature-Ed25519");
    const timestamp = req.get("X-Signature-Timestamp");

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send("Bad request signature");
      throw new Error("Bad request signature");
    }
  };
}

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = "https://discord.com/api/v10/" + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      "Content-Type": "application/json; charset=UTF-8",
      "User-Agent":
        "DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)",
    },
    ...options,
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: "PUT", body: commands });
  } catch (err) {
    console.error(err);
  }
}

export async function PromptOpenAI(prompt, type, size) {
  const options = {
    text: {
      messages: [
        {
          role: "system",
          content: `You are a protocol droid from Star Wars named, C-3GPT. ${prompt}`,
        },
      ],
      model: "gpt-3.5-turbo",
    },
    image: {
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: size,
    },
  };
  let response;

  try {
    response =
      type === "text"
        ? await openai.chat.completions.create({ ...options[type] })
        : await openai.images.generate({ ...options[type] });
  } catch (err) {
    if (
      err?.status === 400 &&
      err?.error?.code === "content_policy_violation"
    ) {
      return {
        status: 500,
        message: "Inappropriate prompts are not currently supported, sorry.",
      };
    }
    return {
      status: 500,
      message: "Something screwed up when hitting OpenAI.",
    };
  }

  try {
    return {
      status: 200,
      message:
        type === "text"
          ? response.choices[0].message.content
          : `${response.data[0].url}\n${response.data[0].revised_prompt}`,
    };
  } catch (err) {
    return {
      status: 500,
      message:
        "You are prompting C-3GPT too quickly, or Metzark needs to add $ to his OpenAI account.",
    };
  }
}
