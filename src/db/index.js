import Dexie from 'dexie';
import { uuid, fisherYates } from '../utils/helpers';

export const db = new Dexie('DailyseedDB');

db.version(1).stores({
  prompts: 'id, session, enabled, order',
  shuffleBags: 'session',
  entries: 'id, date, type, createdAt',
  settings: 'key'
});

const DEFAULT_MORNING_PROMPTS = [
  "What's one small action you'll take today toward something that matters?",
  "How do you want to feel by the end of today?",
  "What's one thing that would make today feel like a win?",
  "What's one thought or worry you want to let go of before starting?",
  "Who or what are you grateful for right now?"
];

const DEFAULT_EVENING_PROMPTS = [
  "Did today feel the way you hoped it would this morning?",
  "What are you proud of, even if small?",
  "What's one moment from today worth remembering?",
  "What drained your energy today, and why?",
  "What do you want tomorrow-you to know?"
];

export const DEFAULT_SETTINGS = {
  key: 'singleton',
  morningTime: '08:00',
  eveningTime: '21:00',
  morningSessionSize: 3,
  eveningSessionSize: 3,
  loopCloserEnabled: true,
  theme: 'system',
  onboardingComplete: false
};

export async function seedDefaults() {
  const count = await db.prompts.count();
  if (count === 0) {
    const morning = DEFAULT_MORNING_PROMPTS.map((text, i) => ({
      id: uuid(), session: 'morning', text, source: 'default',
      enabled: true, isLoopCloser: false, order: i
    }));
    const evening = DEFAULT_EVENING_PROMPTS.map((text, i) => ({
      id: uuid(), session: 'evening', text, source: 'default',
      enabled: true, isLoopCloser: i === 0, order: i
    }));
    await db.prompts.bulkAdd([...morning, ...evening]);
  }
  const settings = await db.settings.get('singleton');
  if (!settings) await db.settings.put(DEFAULT_SETTINGS);
}

// Shuffle Bag Logic
export async function drawSessionPrompts(session) {
  const settings = await db.settings.get('singleton');
  const sessionSize = session === 'morning' ? settings.morningSessionSize : settings.eveningSessionSize;

  let loopCloser = null;
  let slotsToFill = sessionSize;

  if (session === 'evening' && settings.loopCloserEnabled) {
    loopCloser = await db.prompts.where('session').equals('evening').and(p => p.isLoopCloser).first();
    if (loopCloser && loopCloser.enabled) {
      slotsToFill = Math.max(0, sessionSize - 1);
    } else {
      loopCloser = null;
    }
  }

  const allPrompts = await db.prompts.where('session').equals(session).toArray();
  const poolIds = allPrompts.filter(p => p.enabled && !p.isLoopCloser).map(p => p.id);

  if (slotsToFill === 0 || poolIds.length === 0) {
    return loopCloser ? [loopCloser] : [];
  }

  const poolVersion = [...poolIds].sort().join('|');
  let bag = await db.shuffleBags.get(session);
  let remaining = bag?.remainingIds || [];
  const bagVersion = bag?.poolVersion || '';

  if (poolVersion !== bagVersion || remaining.length === 0) {
    remaining = fisherYates(poolIds);
  }

  let drawn = remaining.splice(0, slotsToFill);
  if (drawn.length < slotsToFill && poolIds.length > 0) {
    const reshuffled = fisherYates(poolIds);
    const need = slotsToFill - drawn.length;
    drawn = [...drawn, ...reshuffled.splice(0, need)];
    remaining = reshuffled;
  }

  await db.shuffleBags.put({ session, remainingIds: remaining, poolVersion });

  const drawnPrompts = (await db.prompts.bulkGet(drawn)).filter(Boolean);
  return loopCloser ? [loopCloser, ...drawnPrompts] : drawnPrompts;
}