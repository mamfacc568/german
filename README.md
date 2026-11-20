# WortSchatz

A German learning app for **English speakers** — mobile-first web app (installable as a PWA).

Screen 1 (built): the **Dictionary**. Searching a German word gives you, in order:

1. **Word card** — gender, plural, IPA + plain-English respelling, English meaning, Hindi meaning (Devanagari + romanised).
2. **Example sentences** — graded A1–C2, German with the head word underlined, English below.
3. **Conjugation matrix** — Präsens / Präteritum / Perfekt, all six persons, endings highlighted,
   with a "watch out" note for the irregular bits. Shown for verbs and for nouns with a verb root.
4. **Word family & stem forms** — the root plus related nouns and adjectives, colour-coded by gender.
5. **Prefix verbs** — the derived verbs built on the same stem, each tagged separable/inseparable
   and `SEIN`/`HABEN`, with a sentence showing the prefix in its real position.
6. **Grammar memory hook** — the one rule worth remembering.

Everything the learner reads *about* German is in English; the German itself stays German.

Screen 2 (built): the **Anki Deck** — a working spaced-repetition trainer.

- Cards come from the words you save in the Dictionary; the deck is seeded with the
  built-in entries on first run so there is something to study.
- A 3D flip card. Front: the German word, a **der / die / das** guess quiz (nouns only) that
  marks your pick right or wrong on the spot, and a cloze-deleted example. Back: article, meaning,
  plural, example with translation and word family on the back.
- Four Anki ratings (Again / Hard / Good / Easy) whose labels show the **real** next
  interval, computed by a simplified SM-2 scheduler in `src/lib/deck.ts`.
  "Again" sends the card back to the end of the session, as Anki does.
- Live New / Learning / Review counters, session progress, retention rate.
- Deck state persists in `localStorage`; auto-audio speaks the word on flip.

Screen 3 (built, under the **Vocabulary** tab): **Articles & gender**.

- Every noun the app knows — head words *and* the nouns inside each word family —
  collected, deduplicated and counted by `der` / `die` / `das`, with percentages.
- Tap a gender card or a filter segment to narrow the list; tap any word to open it
  in the Dictionary (family nouns open the entry that lists them).
- "Endings that give it away": suffix rules (`-ung` → die, `-chen` → das, …) matched
  against the actual word list, so each rule shows its real examples — and flags any
  word in the list that breaks it.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173. On a phone, use "Add to Home Screen" to install it.

## Project layout

| Path | What it holds |
| --- | --- |
| `src/styles/tokens.css` | The design system — colour ramps, typography scale, spacing, radius, elevation. **Single source of truth.** |
| `src/styles/app.css` | Component styles, all built on the tokens. |
| `src/data/dictionary.ts` | Dictionary entries + the lookup function. Swap this for an API later. |
| `src/components/` | Dictionary: `WordCard`, `ExampleSentences`, `ConjugationMatrix`, `WordFamily`, `PrefixVerbs`, `GrammarTip`. Deck: `DeckScreen`, `Flashcard`, `RatingDock`. Grammar: `GenderScreen`. Progress: `ProgressScreen`. Shell: `AppHeader`, `SearchBar`, `BottomNav`, `Icons`. |
| `src/lib/deck.ts` | Deck store, SM-2 scheduler, localStorage persistence. |
| `src/lib/genders.ts` | Collects every noun, counts by article, matches the ending rules. |
| `src/lib/progress.ts` | Streak, activity, due forecast, deck mix, gender/level mix. |
| `src/lib/search.ts` | Search index over head words, plurals, every conjugated form, prefix verbs, word families, English and Hindi. |
| `src/lib/markup.tsx` | `[[marker]]` renderer for highlighting words in sentences, `**bold**` / `||italic||` for notes, plus German text-to-speech. |

Screen 4 (built): **Progress** — counted from real reviews, nothing simulated.

- Three headline tiles, each captioned with what it actually counts: words in deck
  (saved to study), day streak (days in a row), % recalled (answered without "Again").
- **Nouns & verbs**: how many of each are in the deck and how many you have reviewed
  at least once. Verbs have no gender, so they appear here rather than in Gender balance.
- **Coming up**: how many cards fall due on each of the next 7 days, from each card's
  own `due` timestamp.
- **Deck make-up**: one segmented bar of New / Learning / Review plus a mature count
  (interval past 21 days).
- **Last two weeks**: reviews per day, from a review log kept in `localStorage`.
- **Gender balance** and **Level mix** of the words being studied, and a
  **Worth another look** list ranked by lapses.
- The header streak is now the real streak — it reads "Start today" at zero rather
  than showing an invented number.

## Search

One index, built from every field an entry has, so all of these find `stehen`:

| You type | Why it matches |
| --- | --- |
| `ste`, `stehen` | the head word |
| `steht`, `stand` | a conjugated form |
| `aufstehen` | a prefix verb built on it |
| `to stand` | the English meaning |
| `khada hona` / `खड़ा होना` | the Hindi meaning |
| `Häuser` | a plural (-> `Haus`) |
| `Unentschlossenheit` | a word-family member (-> `Entscheidung`) |

Suggestions appear as you type and each row says *why* it matched, so an English or
inflected hit is never a surprise. Umlauts fold (`Haeuser`, `Häuser`, `hauser` all work)
and a leading article is ignored.

## Design system

| Role | Hex | Used for |
| --- | --- | --- |
| Primary | `#2563EB` | Meanings, actions, active nav, masculine (`der`) |
| Secondary | `#F59E0B` | Grammar tips, pronunciation respelling, C-level badges |
| Tertiary | `#10B981` | Saved / success state, A-level badges |
| Neuter `das` | `#0D9488` | Teal, not green: against the `die` rose a green fails colourblind separation |
| Neutral | `#0F172A` | Text and surfaces |
| Feminine | `#E11D48` | `die` accents |

Typeface: **Plus Jakarta Sans** (400–800) for headline, body and label — loaded from Google Fonts.

## Not built yet

The Anki Deck, Grammar and Progress tabs are placeholder screens. Word audio uses the
browser's built-in German voice; no recorded audio or backend yet.
