import { useEffect, useState } from 'react';
import LevelCard from './LevelCard.jsx';
import TimerRing from './TimerRing.jsx';
import PositionBoard from './PositionBoard.jsx';
import StackModal from './StackModal.jsx';
import HandRankingsModal from './HandRankingsModal.jsx';
import DisplaySettingsModal from './DisplaySettingsModal.jsx';
import { changeLevel, saveEditedStacks, toggleTimer } from '../state/actions.js';
import { getCurrentLevel, getNextLevel } from '../state/pokerLogic.js';
import { useDisplaySettings } from '../hooks/useDisplaySettings.js';
export default function TimerPage({ tournamentState, setTournamentState, onReset, onLevelChangeSound }){
 const [stackModalOpen,setStackModalOpen]=useState(false),[handRankingsOpen,setHandRankingsOpen]=useState(false),[displaySettingsOpen,setDisplaySettingsOpen]=useState(false); const {displaySettings, updateDisplaySetting, resetDisplaySettings}=useDisplaySettings(); const current=getCurrentLevel(tournamentState), next=getNextLevel(tournamentState);
 useEffect(()=>{const h=e=>{if(e.key==='Escape'){setStackModalOpen(false);setHandRankingsOpen(false);setDisplaySettingsOpen(false);}}; document.addEventListener('keydown',h); return()=>document.removeEventListener('keydown',h);},[]);
 const toggle=()=>setTournamentState(s=>toggleTimer(s)); const level=(d)=>{setTournamentState(s=>changeLevel(s,d)); onLevelChangeSound?.();};
 return <div className='timer-page'><div className='top-bar'><div className='button-cluster'><button type='button' className='btn btn-gray' onClick={()=>level(-1)}>&larr; Level</button><button type='button' className='btn btn-gray' onClick={()=>level(1)}>Level &rarr;</button></div><div className='button-cluster'><button type='button' className='btn btn-gray' onClick={()=>setHandRankingsOpen(true)}>Hand rankings</button><button type='button' className='btn btn-gray' onClick={()=>setDisplaySettingsOpen(true)}>Skjerm</button><button type='button' className='btn btn-gray' onClick={()=>setStackModalOpen(true)}>Endre stacks</button><button type='button' className='btn btn-danger' onClick={onReset}>Avslutt</button></div></div><div className='hero-grid'><LevelCard title='Nåværende level' level={current}/><section className='timer-stage'><TimerRing level={current} timeRemainingSec={tournamentState.timeRemainingSec} currentPot={tournamentState.currentPot} totalSegments={displaySettings.timerSegmentCount} timerRunning={tournamentState.timerRunning} onToggleTimer={toggle}/></section><LevelCard title='Neste level' level={next}/></div><img src='/chips1.png' alt='Chips' className='chips-hero' onError={e=>{e.currentTarget.style.display='none';}}/><PositionBoard tournamentState={tournamentState}/><StackModal isOpen={stackModalOpen} players={tournamentState.players} onClose={()=>setStackModalOpen(false)} onSave={(values)=>{setTournamentState(s=>saveEditedStacks(s,values)); setStackModalOpen(false);}}/><HandRankingsModal isOpen={handRankingsOpen} onClose={()=>setHandRankingsOpen(false)}/><DisplaySettingsModal isOpen={displaySettingsOpen} displaySettings={displaySettings} onChange={updateDisplaySetting} onReset={resetDisplaySettings} onClose={()=>setDisplaySettingsOpen(false)}/></div>;
}
