import { YoutubePlayer } from './YoutubePlayer'
import Draggable from 'react-draggable';
import { css } from '@emotion/css';
import { PomoStatus } from '../PomodoroStatus/PomodStatus';
import ReactFlipClock from '../flipclock/ReactFlipClock';
import { useContext } from 'react';
import { PomoConfigsContext } from '../UserConfigs/PomoConfigsContext';

function youtube_parser(url){
  // Check for playlist URL
  const listMatch = url.match(/[?&]list=([^#&]+)/);
  if (listMatch) {
    // If there's also a video ID, extract it for starting point
    const vidMatch = url.match(/[?&]v=([^#&]{11})/);
    return { type: 'playlist', listId: listMatch[1], vid: vidMatch ? vidMatch[1] : undefined };
  }
  // Single video
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  var match = url.match(regExp);
  const vid = (match&&match[7].length===11)? match[7] : false;
  return vid ? { type: 'video', vid } : false;
}

export function PlayerWithStatus(props) {
  const PomoConfigs = useContext(PomoConfigsContext);
  const youtubeUrl = PomoConfigs.playerUrl ? PomoConfigs.playerUrl : "";
  const parsed = youtube_parser(youtubeUrl)

  var shouldPlay = false;
  if (props.focus && !props.overTime) {
    shouldPlay = true;
  }

  const playerStatusClassName = css`
    height: calc(100vh - 64px);
    width: 100vw;
    max-width:100%;
    max-height:100%;
  `

  return (
    <div className={playerStatusClassName}>
      <YoutubePlayer parsed={parsed} shouldPlay={shouldPlay}/>
      <div>
        <Draggable bounds={"." + playerStatusClassName}>
          <div className={css`
            background: white;
            opacity: 0.7;
            position: absolute;
            top: 10vh;
            left: 10px;

            .flip-clock {
                font-size: 15px;
            }

            padding: 10px;
            border-radius: 10px;
            cursor: grab;
        `}>
            <PomoStatus className={
              css`
                font-size: 70px;
                margin: 0 auto;
                text-align: center;
              `
            } focus={props.focus} />
            <ReactFlipClock startTime={props.startTime} />
          </div>
        </Draggable>
      </div>

    </div>

  )
}

export default PlayerWithStatus