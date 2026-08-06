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
  "What is the one thing I most want to accomplish today, and why does it matter to me?",
  "If today were the only day I had this week, what would I make sure to do?",
  "What kind of person do I want to be today — in my words, my actions, my energy?",
  "What is my intention for how I treat others today?",
  "What does a good day look like for me, specifically, today?",
  "What single word do I want to carry with me as a theme today?",
  "If I could guarantee one feeling at the end of today, what would it be and how will I create it?",
  "What is one small thing I can do today that future me will thank me for?",
  "What am I building — slowly, day by day — and how does today fit into that?",
  "Who do I want to show up as today: at work, at home, within myself?",
  "What mindset do I need to bring to today's challenges?",
  "What limiting belief might hold me back today, and how will I gently challenge it?",
  "What is one thing I can choose to be curious about rather than resistant to today?",
  "Where in my life am I being too hard on myself, and can I soften that today?",
  "What would it look like to approach today with an open hand rather than a clenched fist?",
  "What story am I telling myself about today — is it true, is it useful?",
  "What assumption am I carrying into today that might need to be questioned?",
  "If I approached today with 10% more patience, what would change?",
  "What would today look like if I chose trust over fear?",
  "What is one thing I will refuse to catastrophize about today?",
  "What am I grateful for before the day has even begun?",
  "Who in my life am I taking for granted, and how can I appreciate them today?",
  "What ordinary thing in my life is actually extraordinary if I stop to look at it?",
  "What challenge in my life right now might actually be shaping me in a good way?",
  "What is one resource I have today — physical, emotional, relational — that I often overlook?",
  "What about my body am I grateful for this morning?",
  "What part of my current season of life contains something I'll miss later?",
  "What did yesterday give me that I can be thankful for today?",
  "What is beautiful about where I am right now — in this moment, this place, this chapter?",
  "What three micro-joys am I looking forward to today, no matter how small?",
  "What is the most important task today and what might distract me from it?",
  "What can I let go of from my to-do list today without guilt?",
  "Where is my energy best spent today — and where am I tempted to waste it?",
  "What decision have I been avoiding that I could make today?",
  "What conversation have I been putting off that would free me up emotionally?",
  "If I could only do three things today, what would they be?",
  "What is the difference between what is urgent and what is truly important today?",
  "What is one thing I keep saying I'll do it later about — and is today the day?",
  "Where do I need to set a boundary today to protect my time and energy?",
  "What project or relationship deserves my best attention today?",
  "What would I try today if I knew I could not fail?",
  "What skill am I working on, and what is one small way I can practice it today?",
  "What book, conversation, or idea do I want to sit with today?",
  "What problem in my life could I approach from a completely different angle today?",
  "What would I do differently today if I were ten years wiser?",
  "What is one new habit I am building, and how will I protect it today?",
  "If today were a chapter in a book about my life, what would I want to be written about it?",
  "What is one comfort zone I am willing to nudge the edge of today?",
  "What question am I sitting with that I want to explore through today?",
  "How can I make today even slightly more creative than yesterday?",
  "Who needs to hear from me today — a message, a call, a kind word?",
  "How can I make someone else's day better without it costing me much?",
  "Who deserves my full, undivided presence today?",
  "What relationship in my life needs more care and intention?",
  "How can I listen more deeply today rather than waiting for my turn to speak?",
  "What would it mean to be a truly good friend, partner, or colleague today?",
  "Who has helped me recently that I haven't properly thanked?",
  "What misunderstanding can I move toward resolving today?",
  "How can I express love or appreciation in a language the other person actually receives?",
  "Who inspires me, and what can I learn from them today?",
  "How does my body feel this morning, and what does it need today?",
  "What will I eat, move, and rest in ways that honor my body today?",
  "What drains my energy and how can I minimize it today?",
  "What fills me up — and have I scheduled any of it today?",
  "What is my energy level right now, and what is a realistic expectation for today?",
  "What is one act of physical self-care I will commit to today?",
  "How did I sleep, and what do I need to compensate for or build on?",
  "What does my nervous system need to feel safe and regulated today?",
  "How can I spend even ten minutes outside today?",
  "What would it mean to move through today slowly and deliberately rather than rushed?",
  "What emotion is present in me this morning before the day starts?",
  "What am I anxious about today, and is that anxiety pointing to something real?",
  "What am I hoping for today that I haven't said out loud?",
  "Is there something I'm dreading — and can I reframe how I see it?",
  "What unfinished emotional business from yesterday might I be carrying?",
  "What do I need to forgive — in someone else or myself — to start fresh today?",
  "What emotion do I tend to suppress, and can I give it a little space this morning?",
  "What part of me needs to be heard before I go out into the world today?",
  "Where is fear showing up in my life right now, and what is it trying to protect?",
  "What would it feel like to move through today from a place of wholeness rather than lack?",
  "What do I believe in that I want to reflect through my actions today?",
  "What is one value I hold that is being tested right now, and how will I uphold it?",
  "In five years, will today's worries matter? What will matter?",
  "What kind of life am I slowly building, and is today's plan aligned with it?",
  "What legacy am I quietly creating through the small choices I make daily?",
  "What is one thing I could do today that aligns with who I truly want to become?",
  "What does success actually mean to me — not to anyone else, but to me?",
  "What am I compromising on that I shouldn't be, and does today offer a chance to correct it?",
  "What do I want people to remember about how I made them feel — and can I live that today?",
  "What is the most honest thing I can say about where I am in life right now?",
  "What do I know to be true about myself that I need to remember today?",
  "What is one strength I have that will be especially useful today?",
  "What past version of me overcame something hard — and what did they teach me?",
  "What affirmation could I write today that actually feels true, not hollow?",
  "What do I deserve today — and am I willing to let myself have it?",
  "What negative self-talk tends to show up for me and how will I answer it back today?",
  "What evidence do I have that I am capable of handling today?",
  "Where have I grown recently that I haven't fully acknowledged to myself?",
  "What would I say to a dear friend going through my exact situation this morning?",
  "What is one thing I am proud of about myself, right now, before today has even begun?",
];

const DEFAULT_EVENING_PROMPTS = [
  "Did today feel the way you hoped it would this morning?",
  "What happened today that I didn't expect?",
  "What was the single best moment of my day, no matter how small?",
  "What made me smile or laugh today?",
  "What did I accomplish today that deserves quiet acknowledgment?",
  "What was harder than expected today, and how did I handle it?",
  "What was easier than I feared — and what does that tell me?",
  "Where did I waste time today, and why?",
  "What did today teach me that I didn't know this morning?",
  "What was the turning point of my day — the moment that shifted everything?",
  "What went unfinished today, and is that okay?",
  "What emotion defined most of today?",
  "What am I carrying into the night that I need to set down?",
  "What frustrated me today, and what was underneath that frustration?",
  "What made me feel genuinely alive today?",
  "Was there a moment today when I felt at peace — what created it?",
  "What am I still thinking about from today that needs to be processed?",
  "What anxiety am I bringing to bed that I can acknowledge and then release?",
  "Did I allow myself to feel my feelings today, or did I push them aside?",
  "What do I need to grieve, let go of, or forgive from today?",
  "What part of me felt most alive today, and what part felt most suppressed?",
  "What three things am I grateful for from today specifically?",
  "Who made my day better — even in a small, forgettable way?",
  "What did I eat, see, or experience today that I genuinely enjoyed?",
  "What kindness was shown to me today that I almost didn't notice?",
  "What beauty did I encounter today — in nature, in people, in a moment?",
  "What went right today that I didn't stop to appreciate?",
  "Who am I grateful to have in my life, and did that show up in how I treated them today?",
  "What ordinary moment from today was actually kind of extraordinary?",
  "What resource or privilege did I benefit from today that I usually take for granted?",
  "What is one thing about this specific day I want to remember?",
  "How did I show up for the people I love today?",
  "Was there a moment today when I could have been kinder — what happened?",
  "Who did I connect with today in a way that filled me up?",
  "Did I fully listen to someone today, or was I somewhere else in my head?",
  "Is there someone I need to apologize to or follow up with tomorrow?",
  "What did someone say to me today that is worth sitting with?",
  "How did I make others feel today — if I'm being honest?",
  "Who did I think about today that I should reach out to soon?",
  "What relationship in my life is quietly asking for more of my attention?",
  "Did I express love, appreciation, or care today in a way I feel good about?",
  "Did I live in alignment with my values today? Where did I fall short?",
  "Was there a moment I chose the easy path over the right one?",
  "Did I say something today I wish I could take back?",
  "Was I honest today — with others and with myself?",
  "What promise did I make to myself today, and did I keep it?",
  "Where did I show courage today, even quietly?",
  "Was there a moment I let fear make a decision for me today?",
  "Did I treat my body with care and respect today?",
  "Was I the version of myself I want to be, or did I drift from it — and why?",
  "What is one thing I will do differently tomorrow based on how today went?",
  "What is one mistake I made today that I can learn from without shame?",
  "What challenged my thinking today and might be changing my perspective?",
  "What skill or quality did I practice today — deliberately or without realizing it?",
  "What feedback — from someone or from circumstances — am I receiving and what should I do with it?",
  "What question arose for me today that I want to keep exploring?",
  "What did I notice about myself today that surprised me?",
  "What pattern in my behavior showed up again today — and what do I want to do about it?",
  "What would I tell myself about today if I were writing it in a memoir ten years from now?",
  "Where did I play it safe when I could have been braver?",
  "What growth have I made this week that I haven't stopped to acknowledge?",
  "How did I feel physically throughout today, and what does my body need tonight?",
  "What depleted my energy most today?",
  "What restored or replenished me today?",
  "Did I eat and drink in ways that honored my body today?",
  "How much time did I spend on screens vs. being present in real life?",
  "Did I get outside or move my body today? How did that affect me?",
  "What did I do today purely for myself, with no agenda or output?",
  "What would my body say to me right now if it could speak?",
  "Did I rest when I needed to, or did I push through at a cost?",
  "What does my body or mind need in order to sleep well tonight?",
  "What thoughts are crowding my mind right now that I need to write out to release?",
  "What is tomorrow's most important priority, so I can stop holding it in my head tonight?",
  "What am I overthinking that I can safely put down until morning?",
  "What unfinished conversation or situation is taking up space in my mind?",
  "What is one worry I'm carrying that I have absolutely no control over?",
  "What can I hand over — to time, to someone else, to a higher power — so I can rest?",
  "What decision am I trying to make that would benefit from being slept on?",
  "What noise — social, digital, mental — do I need to let go of before sleep?",
  "What would happen if I simply trusted that tomorrow will have what it needs?",
  "What is the kindest thing I can say to myself before I close my eyes tonight?",
  "How does today fit into the larger story of my life right now?",
  "Am I heading in a direction I actually believe in? What is today's evidence?",
  "What chapter am I in, and how do I feel about it?",
  "What is something I want my life to contain that it doesn't yet — and what is one step toward it?",
  "What have I been telling myself I'll do someday that needs a real date?",
  "What does my life look like from the outside — and is that different from how it feels inside?",
  "What do I want to be true about my life five years from now, and did today point toward it?",
  "What is my relationship with time right now — am I rushing it, wasting it, or living in it?",
  "What would I regret most if today were my last — and is there still time to change it?",
  "What part of my life is quietly asking for more courage, attention, or love?",
  "What is one thing I want to carry into tomorrow from today?",
  "What am I consciously choosing to leave behind with this day?",
  "What am I looking forward to when I wake up tomorrow?",
  "If I had to describe today in one word, what would it be — and why?",
  "What softness or compassion do I want to extend to myself tonight?",
  "What was today's gift — even if it was wrapped in difficulty?",
  "Who do I want to be tomorrow, and what seeds can I plant tonight to support that?",
  "What does rest mean to me right now, and can I allow myself to fully have it?",
  "What is the most honest, true, tender thing I can say about this day?",
  "What am I grateful for about the simple fact that I got to live today?",
];

export const DEFAULT_SETTINGS = {
  key: 'singleton',
  morningTime: '07:30',
  eveningTime: '21:30',
  morningSessionSize: 1,
  eveningSessionSize: 1,
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