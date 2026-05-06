import { CHIP_TYPES, POSITION_MAP, REMOVAL_PRIORITY, STREETS } from './pokerConstants.js';
export const cloneState = (state) => structuredClone(state);
export function getCurrentLevel(state) { return state.blinds[state.currentLevelIndex] || state.blinds[state.blinds.length - 1]; }
export function getNextLevel(state) { return state.blinds[Math.min(state.currentLevelIndex + 1, state.blinds.length - 1)] || getCurrentLevel(state); }
export function emptyChipState() { return { white: 0, red: 0, green: 0, blue: 0, black: 0 }; }
export function chipStateAmount(chips) { if (!chips) return 0; return CHIP_TYPES.reduce((s, c) => s + ((Number(chips[c.key]) || 0) * c.value), 0); }
export function getSeatIndicesOfActivePlayers(players) { return players.map((player,index)=>({player,index})).filter(({player})=>!player.eliminated && player.chips>0).map(({index})=>index); }
export function calculateDynamicPositions(activeCount) {
  const mapped = Math.max(5, Math.min(9, activeCount));
  const base = POSITION_MAP[mapped] ? [...POSITION_MAP[mapped]] : [];
  if (activeCount >= 5 && activeCount <= 9) { const d = base.indexOf('Dealer'); if (d > -1) { base.splice(d, 1); base.unshift('Dealer'); } return base; }
  const nine = ['Dealer','Small Blind','Big Blind','Under the Gun','Under the Gun +1','Middle Position','Lowjack','Hijack','Cutoff'];
  const remove = REMOVAL_PRIORITY.slice(0, Math.max(0, 9 - activeCount));
  return nine.filter((p) => !remove.includes(p));
}
export function applyPositionsForRound(state) {
  const n = cloneState(state); const active = getSeatIndicesOfActivePlayers(n.players);
  n.players = n.players.map((p) => { const eliminated = p.chips <= 0; return { ...p, eliminated, active: !eliminated, currentPosition: eliminated ? 'Slått ut' : '' }; });
  if (!active.length) return n;
  if (!active.includes(n.dealerIndex)) n.dealerIndex = active[active.length - 1];
  const ordered = []; const dealerPos = active.indexOf(n.dealerIndex);
  for (let i=0;i<active.length;i++) ordered.push(active[(dealerPos + 1 + i) % active.length]);
  ordered.unshift(n.dealerIndex);
  const labels = calculateDynamicPositions(active.length);
  ordered.forEach((seatIndex, idx) => { if (n.players[seatIndex]) n.players[seatIndex].currentPosition = labels[idx] || 'Dealer'; });
  return n;
}
export function moveDealerToNextActive(state) {
  const n = cloneState(state); const active = getSeatIndicesOfActivePlayers(n.players); if (!active.length) return n;
  const pos = active.indexOf(n.dealerIndex); n.dealerIndex = pos === -1 ? active[0] : active[(pos + 1) % active.length]; return applyPositionsForRound(n);
}
export function createHandState(players) {
  const h = { streetIndex: 0, streetBets: { preflop: {}, flop: {}, turn: {}, river: {} }, totalCommitted: {}, folded: {}, allIn: {}, winnersByPot: {} };
  players.forEach((p) => { h.totalCommitted[p.id]=0; h.folded[p.id]=false; h.allIn[p.id]=false; STREETS.forEach((s)=>{ h.streetBets[s][p.id]=emptyChipState(); }); });
  return h;
}
export function createHandStateWithBlinds(state) { const n=cloneState(state); n.handState=createHandState(n.players); return autoPostBlinds(n); }
export function autoPostBlinds(state) { const n=cloneState(state); const level=getCurrentLevel(n); if (!level || !n.handState) return n; const sb=n.players.find(p=>p.currentPosition==='Small Blind'); const bb=n.players.find(p=>p.currentPosition==='Big Blind'); if(sb) postForcedBetInPlace(n,sb.id,level.sb,'preflop'); if(bb) postForcedBetInPlace(n,bb.id,level.bb,'preflop'); return recalcPot(n); }
export function postForcedBetInPlace(state, playerId, amount, street) { const p=state.players.find(x=>x.id===playerId); if(!p||p.eliminated||p.chips<=0)return; let remaining=Math.min(amount,p.chips); const chips=state.handState.streetBets[street][playerId]; [...CHIP_TYPES].sort((a,b)=>b.value-a.value).forEach((t)=>{while(remaining>=t.value){chips[t.key]+=1;remaining-=t.value;}}); if(remaining>0) chips.white += Math.ceil(remaining/10); syncTotalCommittedForPlayerInPlace(state, playerId); if(getRemainingChipsForPlayer(state, playerId)===0) state.handState.allIn[playerId]=true; }
export function syncTotalCommittedForPlayerInPlace(state, playerId) { let total=0; STREETS.forEach((s)=>{ total += chipStateAmount(state.handState.streetBets[s][playerId]); }); state.handState.totalCommitted[playerId]=total; }
export function recalcPot(state) { const n=cloneState(state); n.currentPot=Object.values(n.handState?.totalCommitted || {}).reduce((s,v)=>s+(Number(v)||0),0); return n; }
export function getStreetName(state) { return STREETS[state.handState?.streetIndex]; }
export function getRemainingChipsForPlayer(state, playerId) { const p=state.players.find(x=>x.id===playerId); if(!p)return 0; return Math.max(0, p.chips - (state.handState?.totalCommitted?.[playerId] || 0)); }
export function addChipToPlayer(state, playerId, chipKey) { const n=cloneState(state); const street=getStreetName(n); const chip=CHIP_TYPES.find(c=>c.key===chipKey); if(!street||!chip)return state; if(getRemainingChipsForPlayer(n,playerId)<chip.value)return state; n.handState.streetBets[street][playerId][chipKey]+=1; syncTotalCommittedForPlayerInPlace(n,playerId); if(getRemainingChipsForPlayer(n,playerId)===0)n.handState.allIn[playerId]=true; return recalcPot(n); }
export function removeChipFromPlayer(state, playerId, chipKey) { const n=cloneState(state); const street=getStreetName(n); if(!street)return state; const chips=n.handState.streetBets[street][playerId]; if(!chips||chips[chipKey]<=0)return state; chips[chipKey]-=1; syncTotalCommittedForPlayerInPlace(n,playerId); if(getRemainingChipsForPlayer(n,playerId)>0)n.handState.allIn[playerId]=false; return recalcPot(n); }
export function setFolded(state, playerId, folded) { const n=cloneState(state); n.handState.folded[playerId]=folded; return n; }
export function setAllIn(state, playerId, allIn) { const n=cloneState(state); n.handState.allIn[playerId]=allIn; if(allIn) pushRemainingStackToCurrentStreetInPlace(n,playerId); return recalcPot(n); }
export function pushRemainingStackToCurrentStreetInPlace(state, playerId) { const street=getStreetName(state); if(!street)return; let rest=getRemainingChipsForPlayer(state,playerId); if(rest<=0)return; const chipState=state.handState.streetBets[street][playerId]; [...CHIP_TYPES].sort((a,b)=>b.value-a.value).forEach((t)=>{while(rest>=t.value){chipState[t.key]+=1; rest-=t.value;}}); if(rest>0)chipState.white+=Math.ceil(rest/10); syncTotalCommittedForPlayerInPlace(state,playerId); }
export function nextStreet(state) { const n=cloneState(state); if(n.handState.streetIndex<STREETS.length-1)n.handState.streetIndex+=1; else n.handState.streetIndex=STREETS.length; return n; }
export function prevStreet(state) { const n=cloneState(state); if(n.handState.streetIndex>0)n.handState.streetIndex-=1; return n; }
export function buildSidePots(state) { const contributors=state.players.filter(p=>!p.eliminated&&(state.handState.totalCommitted[p.id]||0)>0).map(p=>({playerId:p.id,amount:state.handState.totalCommitted[p.id],folded:!!state.handState.folded[p.id]})).sort((a,b)=>a.amount-b.amount); const pots=[]; let prev=0; while(contributors.length){ const min=contributors[0].amount; const layer=min-prev; const active=contributors.filter(c=>c.amount>=min); pots.push({amount:layer*active.length, eligiblePlayerIds:active.filter(c=>!c.folded).map(c=>c.playerId)}); prev=min; while(contributors.length&&contributors[0].amount===min) contributors.shift(); } return pots; }
export function finalizeRound(state) { let n=cloneState(state); const sidePots=buildSidePots(n); const winners=[]; for(let i=0;i<sidePots.length;i++){ const ids=n.handState.winnersByPot[i]||[]; if(!ids.length)return{state,error:`Velg minst én vinner for pot ${i+1}`}; winners.push(ids); } n.players=n.players.map(p=>({...p,chips:Math.max(0,p.chips-(n.handState.totalCommitted[p.id]||0))})); sidePots.forEach((pot,i)=>{const ids=winners[i]; const share=Math.floor(pot.amount/ids.length); let rem=pot.amount-share*ids.length; ids.forEach((id,idx)=>{const pi=n.players.findIndex(p=>p.id===id); if(pi===-1)return; n.players[pi].chips+=share; if(rem>0&&idx===0){n.players[pi].chips+=rem; rem=0;}});}); n.players=n.players.map(p=>({...p,eliminated:p.chips<=0,active:p.chips>0})); n.currentPot=0; n.roundNumber+=1; n=moveDealerToNextActive(n); n=createHandStateWithBlinds(n); return {state:n,error:null}; }
