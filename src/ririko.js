const {
  Client,
  Partials,
  Collection,
  GatewayIntentBits,
} = require("discord.js");
const config = require("config");
const colors = require("colors");

const { RirikoAINLP } = require("app/RirikoAI-NLP");
const getconfig = require("utils/getconfig");
const { RirikoMusic } = require("app/RirikoMusic");
const mongoose = require("mongoose");
const { getLang } = require("./utils/language");

/**
 * Will start a new Discord client
 * @returns {Promise<Client<boolean>>} Discord Client instance
 */
const start = async () => {
  // Creating a new client:
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildIntegrations,
      GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [
      Partials.Channel,
      Partials.Message,
      Partials.User,
      Partials.GuildMember,
      Partials.Reaction,
    ],
    presence: {
      activities: [
        {
          name: "I am the future 🦾",
          type: 0,
        },
      ],
      status: "dnd",
    },
  });

  // Getting the bot token:
  const AuthenticationToken = getconfig.discordToken();
  if (!AuthenticationToken) {
    console.warn(
      "[CRASH] Authentication Token for Discord bot is required! Use Environment Secrets or config.js."
        .red
    );
    process.exit();
  }

  // Include config file into the client
  client.language = config.LANGUAGE || "en";
  client.config = config;

  let lang = getLang();
  const ririkoMusic = new RirikoMusic(client);
  client.player = ririkoMusic.createPlayer();

  // Handler:
  client.prefix_commands = new Collection();
  client.slash_commands = new Collection();
  client.user_commands = new Collection();
  client.message_commands = new Collection();
  client.modals = new Collection();
  client.events = new Collection();

  module.exports = client;

  ["prefix", "application_commands", "modals", "events", "mongoose"].forEach(
    (file) => {
      require(`./handlers/${file}`)(client, config);
    }
  );

  const mongoDbAccessUri =
    config.DATABASE.MongoDB.AccessURI || process.env.MONGODB_ACCESS_URI;

  if (mongoDbAccessUri) {
    const mongoose = require("mongoose");
    mongoose
      .connect(mongoDbAccessUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(async () => {
        console.log(`Connected MongoDB`);
      })
      .catch((err) => {
        console.log("\nMongoDB Error: " + err + "\n\n" + lang.error4);
      });
  } else {
    console.log(lang.error4);
  }

  // Login to the bot:
  await client
    .login(AuthenticationToken)
    .catch((err) => {
      console.error(
        "[CRASH] Something went wrong while connecting to your bot..."
      );
      console.error("[CRASH] Error from Discord API:" + err);
      return process.exit();
    })
    .finally(() => {
      let lines =
          "\n======================= ✦ Ririko AI ✦ =======================\n",
        linesEnd =
          "\n=============================================================\n";
      console.log("\n" + lines.magenta);
      // initiate instance once
      const RirikoAi = RirikoAINLP.getInstance();
      if (RirikoAi.isInitialized === true) {
        console.log("[RirikoAI] Ready to serve the world.".magenta);
      } else {
        console.log(
          "[RirikoAI] Something went wrong. Please check the logs.".red
        );
      }

      // Use this to remove commands list
      // client.application.commands.set([], "755618872920637440");
      console.log(linesEnd.magenta);
    });

  // Handle errors:
  process.on("unhandledRejection", async (err, promise) => {
    console.error(`[ANTI-CRASH] Unhandled Rejection: ${err}`.red);
    console.error(promise);
  });

  process.on("uncaughtException", (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    console.error(err);
  });

  return client;
};

//Export the "ask" function
module.exports = {
  start,
};
