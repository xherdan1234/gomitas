const ping = require("./ping");

jest.mock("discord.js", () => ({
  EmbedBuilder: () => {
    return new (class {
      setAuthor = () => {
        return this;
      };

      setDescription = () => {
        return this;
      };

      setFooter = () => {
        return this;
      };

      setColor = () => {
        return this;
      };
    })();
  },
}));

let mockClient;

const mockMessage = {
    reply: jest.fn(),
    guild: {
      id: "",
    },
  },
  mockArgs = ["!"],
  mockConfig = {},
  prefix = "!",
  mockQuickDB = {
    set: jest.fn(),
  };

describe("prefix command > ping", () => {
  beforeAll(() => {
    // Setup Mock discord API Client
    mockClient = {
      prefix_commands: {
        config: {
          name: "prefix",
          description: "Set the prefix for the guild.",
          usage: "prefix [new prefix]",
        },
        permissions: ["Administrator"],
        owner: false,
        run: "",
        get: jest.fn(),
      },
      user: {
        tag: "",
        displayAvatarURL: jest.fn(),
      },
      ws: {
        ping: jest.fn(),
      },
    };
  });

  it("should be able to call prefix command 'ping'", async () => {
    await ping.run(mockClient, mockMessage, mockArgs, prefix);
  });
});
