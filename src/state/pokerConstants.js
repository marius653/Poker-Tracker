export const POSITION_MAP = {
  5: ['Small Blind', 'Big Blind', 'Under the Gun', 'Cutoff', 'Dealer'],
  6: ['Small Blind', 'Big Blind', 'Under the Gun', 'Hijack', 'Cutoff', 'Dealer'],
  7: ['Small Blind', 'Big Blind', 'Under the Gun', 'Middle Position', 'Hijack', 'Cutoff', 'Dealer'],
  8: ['Small Blind', 'Big Blind', 'Under the Gun', 'Under the Gun +1', 'Lowjack', 'Hijack', 'Cutoff', 'Dealer'],
  9: ['Small Blind', 'Big Blind', 'Under the Gun', 'Under the Gun +1', 'Middle Position', 'Lowjack', 'Hijack', 'Cutoff', 'Dealer'],
};

export const REMOVAL_PRIORITY = [
  'Big Blind',
  'Small Blind',
  'Dealer',
  'Under the Gun',
  'Cutoff',
  'Hijack',
  'Lowjack',
  'Middle Position',
  'Under the Gun +1',
];

export const STREETS = ['preflop', 'flop', 'turn', 'river'];

export const CHIP_DEFINITIONS = [
  {
    key: 'white',
    name: 'Hvit',
    defaultValue: 10,
    className: 'white',
    baseColor: '#eeeeee',
    innerColor: '#f3f3f3',
    edgeColor: '#18155e',
    textColor: '#303236',
  },
  {
    key: 'red',
    name: 'Rød',
    defaultValue: 20,
    className: 'red',
    baseColor: '#d91f43',
    innerColor: '#d91f43',
    edgeColor: '#f2f2f2',
    textColor: '#f5f5f5',
  },
  {
    key: 'green',
    name: 'Grønn',
    defaultValue: 50,
    className: 'green',
    baseColor: '#17875a',
    innerColor: '#17875a',
    edgeColor: '#f2f2f2',
    textColor: '#f5f5f5',
  },
  {
    key: 'blue',
    name: 'Blå',
    defaultValue: 100,
    className: 'blue',
    baseColor: '#18155e',
    innerColor: '#18155e',
    edgeColor: '#f2f2f2',
    textColor: '#f5f5f5',
  },
  {
    key: 'black',
    name: 'Svart',
    defaultValue: 500,
    className: 'black',
    baseColor: '#38383f',
    innerColor: '#38383f',
    edgeColor: '#f2f2f2',
    textColor: '#f5f5f5',
  },
];

export const DEFAULT_CHIP_VALUES = Object.fromEntries(
  CHIP_DEFINITIONS.map((chip) => [chip.key, chip.defaultValue]),
);

export function normalizeChipValues(values = {}) {
  return Object.fromEntries(
    CHIP_DEFINITIONS.map((chip) => {
      const requestedValue = Number(values?.[chip.key]);
      const value = Number.isFinite(requestedValue) && requestedValue > 0
        ? Math.round(requestedValue)
        : chip.defaultValue;

      return [chip.key, value];
    }),
  );
}

export function getChipTypes(source = {}) {
  const values = normalizeChipValues(source?.chipValues || source);

  return CHIP_DEFINITIONS.map((chip) => ({
    ...chip,
    value: values[chip.key],
    label: String(values[chip.key]),
  }));
}

/* Backwards compatibility for code that still imports CHIP_TYPES directly. */
export const CHIP_TYPES = getChipTypes(DEFAULT_CHIP_VALUES);

export const HAND_RANKINGS = [
  {
    rank: 1,
    title: 'Royal Flush',
    desc: 'A, K, Q, J, 10 i samme sort.',
    cards: [
      ['A♥', 'red-suit'],
      ['K♥', 'red-suit'],
      ['Q♥', 'red-suit'],
      ['J♥', 'red-suit'],
      ['10♥', 'red-suit'],
    ],
  },
  {
    rank: 2,
    title: 'Straight Flush',
    desc: 'Fem kort i rekkefølge, samme sort.',
    cards: [
      ['9♠', 'dark-suit'],
      ['8♠', 'dark-suit'],
      ['7♠', 'dark-suit'],
      ['6♠', 'dark-suit'],
      ['5♠', 'dark-suit'],
    ],
  },
  {
    rank: 3,
    title: 'Four of a Kind',
    desc: 'Fire like.',
    cards: [
      ['Q♥', 'red-suit'],
      ['Q♠', 'dark-suit'],
      ['Q♦', 'red-suit'],
      ['Q♣', 'dark-suit'],
      ['3♠', 'dark-suit kicker'],
    ],
  },
  {
    rank: 4,
    title: 'Full House',
    desc: 'Tre like + ett par.',
    cards: [
      ['J♥', 'red-suit'],
      ['J♠', 'dark-suit'],
      ['J♦', 'red-suit'],
      ['7♣', 'dark-suit'],
      ['7♥', 'red-suit'],
    ],
  },
  {
    rank: 5,
    title: 'Flush',
    desc: 'Fem kort i samme sort.',
    cards: [
      ['A♣', 'dark-suit'],
      ['10♣', 'dark-suit'],
      ['8♣', 'dark-suit'],
      ['4♣', 'dark-suit'],
      ['2♣', 'dark-suit'],
    ],
  },
  {
    rank: 6,
    title: 'Straight',
    desc: 'Fem kort i rekkefølge.',
    cards: [
      ['10♥', 'red-suit'],
      ['9♣', 'dark-suit'],
      ['8♦', 'red-suit'],
      ['7♠', 'dark-suit'],
      ['6♥', 'red-suit'],
    ],
  },
  {
    rank: 7,
    title: 'Three of a Kind',
    desc: 'Tre like.',
    cards: [
      ['8♥', 'red-suit'],
      ['8♠', 'dark-suit'],
      ['8♦', 'red-suit'],
      ['K♣', 'dark-suit kicker'],
      ['4♥', 'red-suit kicker'],
    ],
  },
  {
    rank: 8,
    title: 'Two Pair',
    desc: 'To par.',
    cards: [
      ['A♥', 'red-suit'],
      ['A♣', 'dark-suit'],
      ['5♦', 'red-suit'],
      ['5♠', 'dark-suit'],
      ['9♣', 'dark-suit kicker'],
    ],
  },
  {
    rank: 9,
    title: 'One Pair',
    desc: 'Ett par.',
    cards: [
      ['K♥', 'red-suit'],
      ['K♣', 'dark-suit'],
      ['10♦', 'red-suit kicker'],
      ['6♠', 'dark-suit kicker'],
      ['3♥', 'red-suit kicker'],
    ],
  },
  {
    rank: 10,
    title: 'High Card',
    desc: 'Høyeste kort teller.',
    cards: [
      ['A♦', 'red-suit'],
      ['Q♣', 'dark-suit'],
      ['9♠', 'dark-suit'],
      ['6♥', 'red-suit'],
      ['2♣', 'dark-suit'],
    ],
  },
];
