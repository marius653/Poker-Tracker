export const POSITION_MAP = {
  5: ['Small Blind', 'Big Blind', 'Under the Gun', 'Cutoff', 'Dealer'],
  6: ['Small Blind', 'Big Blind', 'Under the Gun', 'Hijack', 'Cutoff', 'Dealer'],
  7: ['Small Blind', 'Big Blind', 'Under the Gun', 'Middle Position', 'Hijack', 'Cutoff', 'Dealer'],
  8: ['Small Blind', 'Big Blind', 'Under the Gun', 'Under the Gun +1', 'Lowjack', 'Hijack', 'Cutoff', 'Dealer'],
  9: ['Small Blind', 'Big Blind', 'Under the Gun', 'Under the Gun +1', 'Middle Position', 'Lowjack', 'Hijack', 'Cutoff', 'Dealer'],
};
export const REMOVAL_PRIORITY = ['Big Blind','Small Blind','Dealer','Under the Gun','Cutoff','Hijack','Lowjack','Middle Position','Under the Gun +1'];
export const STREETS = ['preflop', 'flop', 'turn', 'river'];
export const CHIP_TYPES = [
  { key: 'white', label: '10', value: 10, className: 'white' },
  { key: 'red', label: '20', value: 20, className: 'red' },
  { key: 'green', label: '50', value: 50, className: 'green' },
  { key: 'blue', label: '100', value: 100, className: 'blue' },
  { key: 'black', label: '500', value: 500, className: 'black' },
];
export const HAND_RANKINGS = [
  ['Royal Flush','A, K, Q, J, 10 i samme sort.', [['A♥','red-suit'],['K♥','red-suit'],['Q♥','red-suit'],['J♥','red-suit'],['10♥','red-suit']]],
  ['Straight Flush','Fem kort i rekkefølge, samme sort.', [['9♠','dark-suit'],['8♠','dark-suit'],['7♠','dark-suit'],['6♠','dark-suit'],['5♠','dark-suit']]],
  ['Four of a Kind','Fire like.', [['Q♥','red-suit'],['Q♠','dark-suit'],['Q♦','red-suit'],['Q♣','dark-suit'],['3♠','dark-suit kicker']]],
  ['Full House','Tre like + ett par.', [['J♥','red-suit'],['J♠','dark-suit'],['J♦','red-suit'],['7♣','dark-suit'],['7♥','red-suit']]],
  ['Flush','Fem kort i samme sort.', [['A♣','dark-suit'],['10♣','dark-suit'],['8♣','dark-suit'],['4♣','dark-suit'],['2♣','dark-suit']]],
  ['Straight','Fem kort i rekkefølge.', [['10♥','red-suit'],['9♣','dark-suit'],['8♦','red-suit'],['7♠','dark-suit'],['6♥','red-suit']]],
  ['Three of a Kind','Tre like.', [['8♥','red-suit'],['8♠','dark-suit'],['8♦','red-suit'],['K♣','dark-suit kicker'],['4♥','red-suit kicker']]],
  ['Two Pair','To par.', [['A♥','red-suit'],['A♣','dark-suit'],['5♦','red-suit'],['5♠','dark-suit'],['9♣','dark-suit kicker']]],
  ['One Pair','Ett par.', [['K♥','red-suit'],['K♣','dark-suit'],['10♦','red-suit kicker'],['6♠','dark-suit kicker'],['3♥','red-suit kicker']]],
  ['High Card','Høyeste kort teller.', [['A♦','red-suit'],['Q♣','dark-suit'],['9♠','dark-suit'],['6♥','red-suit'],['2♣','dark-suit']]],
].map(([title, desc, cards], index) => ({ rank: index + 1, title, desc, cards }));
