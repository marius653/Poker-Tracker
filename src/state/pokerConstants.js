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

export const CHIP_TYPES = [
  { key: 'white', label: '10', value: 10, className: 'white' },
  { key: 'red', label: '20', value: 20, className: 'red' },
  { key: 'green', label: '50', value: 50, className: 'green' },
  { key: 'blue', label: '100', value: 100, className: 'blue' },
  { key: 'black', label: '500', value: 500, className: 'black' },
];

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
