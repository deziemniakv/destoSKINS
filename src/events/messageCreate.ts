import { Events, Message } from "discord.js";
import { log } from "../utils/logger";


const spamTracker = new Map<
  string,
  { count: number; lastMessage: number; warned: boolean }
>();

const SPAM_LIMIT = 5;
const SPAM_WINDOW_MS = 5000;

export default {
  name: Events.MessageCreate,
  execute(message: Message): void {
    if (message.author.bot) return;
    if (!message.guild) return;

    const userId = message.author.id;
    const now = Date.now();
    const tracker = spamTracker.get(userId) ?? {
      count: 0,
      lastMessage: now,
      warned: false,
    };

    if (now - tracker.lastMessage > SPAM_WINDOW_MS) {
      tracker.count = 1;
      tracker.lastMessage = now;
      tracker.warned = false;
    } else {
      tracker.count++;
    }

    spamTracker.set(userId, tracker);

    if (tracker.count >= SPAM_LIMIT && !tracker.warned) {
      tracker.warned = true;
      log.warn(
        `[SPAM] User ${message.author.tag} (${userId}) sent ${tracker.count} messages in ${SPAM_WINDOW_MS}ms`
      );
    }

    setTimeout(() => spamTracker.delete(userId), SPAM_WINDOW_MS * 2);
  },
};
