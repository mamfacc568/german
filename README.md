# WortSchatz

A German learning app for **English speakers** — mobile-first web app (installable as a PWA).

Screen 1 (built): the **Dictionary**. Searching a German word gives you, in order:

1. **Word card** — gender, plural, IPA + plain-English respelling, primary meaning, context/nuance.
2. **Example sentences** — graded A1–C2, German with the head word underlined, English below.
3. **Conjugation matrix** — Präsens / Präteritum / Perfekt, all six persons, endings highlighted,
   with a "watch out" note for the irregular bits. Shown for verbs and for nouns with a verb root.
4. **Word family & stem forms** — the root plus related nouns and adjectives, colour-coded by gender.
5. **Prefix verbs** — the derived verbs built on the same stem, each tagged separable/inseparable
   and `SEIN`/`HABEN`, with a sentence showing the prefix in its real position.
6. **Grammar memory hook** — the one rule worth remembering.

Everything the learner reads *about* German is in English; the German itself stays German.

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
| `src/components/` | `AppHeader`, `SearchBar`, `WordCard`, `ExampleSentences`, `ConjugationMatrix`, `WordFamily`, `PrefixVerbs`, `GrammarTip`, `BottomNav`, `Icons`. |
| `src/lib/markup.tsx` | `[[marker]]` renderer for highlighting words in sentences, `**bold**` / `||italic||` for notes, plus German text-to-speech. |

## Design system

| Role | Hex | Used for |
| --- | --- | --- |
| Primary | `#2563EB` | Meanings, actions, active nav, masculine (`der`) |
| Secondary | `#F59E0B` | Grammar tips, pronunciation respelling, C-level badges |
| Tertiary | `#10B981` | Saved / success state, neuter (`das`), A-level badges |
| Neutral | `#0F172A` | Text and surfaces |
| Feminine | `#E11D48` | `die` accents |

Typeface: **Plus Jakarta Sans** (400–800) for headline, body and label — loaded from Google Fonts.

## Not built yet

The Anki Deck, Grammar and Progress tabs are placeholder screens. Word audio uses the
browser's built-in German voice; no recorded audio or backend yet.
