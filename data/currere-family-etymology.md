# Etymology Graph: Latin "currere" (to run) Family

## Summary
10 words connected through borrowing, inheritance, and derivation from Latin **currō** (to run).

---

## Root Word

### curro [Latin] (verb)
**Etymology:** From Proto-Italic *korzō, from Proto-Indo-European *ḱr̥s-é-ti, from Proto-Indo-European *ḱers- ("to run"). Cognate with currus, carrus (via Gaulish), English horse.

**Definition:** to run; to hurry, hasten, speed

**Templates:** root, inh, inh, der, cog

**Key relationships:**
- → Proto-Italic *korzō (inherited from)
- → Proto-Indo-European *ḱers- (inherited from)

---

## Romance Languages (Inherited from Latin)

### correr [Spanish] (verb)
**Etymology:** Inherited from Latin currere ("to run"), from Proto-Italic *korzō, from Proto-Indo-European *ḱers- ("to run").

**Definition:** to run, to jog; to flow

**Templates:** yesno, glossary, inh, inh+, inh

**Key relationships:**
- ← Latin currere (inherited from)
- ← Proto-Italic *korzō (inherited from)
- ← Proto-Indo-European *ḱers- (inherited from)

---

### courir [French] (verb)
**Etymology:** Inherited from Old French courre, corre (modified under the influence of -ir verbs), from Latin currere ("to run"), from Proto-Indo-European *ḱers- ("to run").

**Definition:** to run; to hurry; to rush

**Templates:** yesno, glossary, inh, inh+, inh

**Key relationships:**
- ← Old French courre (inherited from)
- ← Latin currere (inherited from)
- ← Proto-Indo-European *ḱers- (inherited from)

---

### correre [Italian] (verb)
**Etymology:** From Latin currere, from Proto-Italic *korzō, from Proto-Indo-European *ḱr̥s-é-ti, zero-grade thematic present of *ḱers- ("to run").

**Definition:** to run; to hurry, to rush

**Templates:** inh, inh, inh, root

**Key relationships:**
- ← Latin currere (inherited from)
- ← Proto-Italic *korzō (inherited from)
- ← Proto-Indo-European *ḱers- (inherited from)

---

## English Borrowings from Latin/French

### course [English] (noun)
**Etymology:** From Middle English cours, from Old French cours, from Latin cursus ("course of a race"), from currō ("run"), ultimately from Proto-Indo-European *ḱers- ("to run"). Doublet of cursus and cour.

**Definition:** A sequence of events.

**Templates:** root, inh, der, der, der

**Key relationships:**
- ← Middle English cours (inherited from)
- ← Old French cours (derived from)
- ← Latin cursus (derived from)
- ← Latin currō (derived from)
- Doublet: cursus, cour

---

### current [English] (noun/adjective)
**Etymology:** From Middle English curraunt, borrowed from Old French curant (French courant), present participle of courre ("to run"), from Latin currere ("to run") (present participle currens). Doublet of courant.

**Definition:** The generally unidirectional movement of a gas or fluid.

**Templates:** root, inh, der, cog, der

**Key relationships:**
- ← Middle English curraunt (inherited from)
- ← Old French curant (borrowed from)
- ← Latin currere (derived from)
- Doublet: courant

---

### cursor [English] (noun)
**Etymology:** Borrowed from Latin cursor ("runner"), from currō ("run") + -or (agentive suffix). Ultimately from Proto-Indo-European.

**Definition:** A part of any of several scientific or measuring instruments that moves back and forth to indicate a position; a moving icon representing the position of the pointing device.

**Templates:** root, bor, der

**Key relationships:**
- ← Latin cursor (borrowed from)
- ← Latin currō (derived from)

---

### occur [English] (verb)
**Etymology:** Originally "meet (in argument)", borrowed from Middle French occurrer, from Latin occurrō ("run to meet, run against, befall, present itself") from prefix ob- ("against") + verb currō ("run, hurry, move").

**Definition:** To happen or take place; to present or offer itself.

**Templates:** root, bor, der

**Key relationships:**
- ← Middle French occurrer (borrowed from)
- ← Latin occurrō (derived from)
- ← Latin ob- + currō (compound)

---

### recur [English] (verb)
**Etymology:** Learned borrowing from Latin recurrō ("to hurry or run back; to return, revert"), from re- (prefix meaning 'back, backwards') + currō ("to hasten, hurry; to move, travel; to run") (ultimately from Proto-Indo-European *ḱers- ("to run")).

**Definition:** Of an event, situation, etc.: to appear or happen again, especially repeatedly.

**Templates:** root, lbor, glossary, der, col-top

**Key relationships:**
- ← Latin recurrō (learned borrowing)
- ← Latin re- + currō (compound)
- ← Proto-Indo-European *ḱers- (derived from)

---

### excursion [English] (noun)
**Etymology:** Borrowed from Latin excursiō ("a running out, an inroad, invasion, a setting out, beginning of a speech"), from excurrere ("to run out"), from ex ("out") + currere ("to run"). By surface analysis, excurse + -ion.

**Definition:** A brief recreational trip; a journey out of the usual way; a field trip.

**Templates:** root, bor, surf

**Key relationships:**
- ← Latin excursiō (borrowed from)
- ← Latin excurrere (derived from)
- ← Latin ex- + currere (compound)

---

## Graph Structure

### Core relationships:

```
Proto-Indo-European *ḱers- ("to run")
    ↓ (inherited)
Proto-Italic *korzō
    ↓ (inherited)
Latin currō/currere
    ↓ (inherited)                      ↓ (borrowed)
    ↓                                  ↓
Romance Languages              English Borrowings
├── Spanish: correr           ├── cursor (← Latin cursor)
├── French: courir            ├── occur (← Latin occurrō)
└── Italian: correre          ├── recur (← Latin recurrō)
                              ├── excursion (← Latin excursiō)
                              ├── course (← Latin cursus ← Old French)
                              └── current (← Latin currere ← Old French)
```

### Relationship types:
- **Inherited (inh)**: Natural language evolution (Latin → Romance languages)
- **Borrowed (bor)**: Loanwords taken into English from Latin/French
- **Derived (der)**: General derivation
- **Learned borrowing (lbor)**: Scholarly/technical borrowing
- **Compound**: Formed with prefixes (ob-, re-, ex-)
- **Doublet**: Different evolutions of the same root word

---

## Next Steps

1. Extract structured etymology templates from each entry
2. Parse template arguments to identify source/target languages and words
3. Create nodes for each word (with language, definition, POS)
4. Create directed edges for relationships (type: inherited/borrowed/derived)
5. Add intermediate nodes (Proto-Italic, PIE root, Latin compounds)
6. Visualize in React Flow with force-directed layout
