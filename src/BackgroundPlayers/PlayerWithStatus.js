import { YoutubePlayer } from './YoutubePlayer'
import Draggable from 'react-draggable';
import { css } from '@emotion/css';
import { PomoStatus } from '../PomodoroStatus/PomodStatus';
import ReactFlipClock from '../flipclock/ReactFlipClock';
import { useContext } from 'react';
import { PomoConfigsContext } from '../UserConfigs/PomoConfigsContext';

function youtube_parser(url){
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  var match = url.match(regExp);
  return (match&&match[7].length===11)? match[7] : false;
}

export function PlayerWithStatus(props) {
  const PomoConfigs = useContext(PomoConfigsContext);
  const youtubeUrl = PomoConfigs.playerUrl ? PomoConfigs.playerUrl : "";
  const youtubeVid = youtube_parser(youtubeUrl)
  if (!youtubeVid) {
    return (<></>)
  }

  var shouldPlay = true;
  if (props.focus && props.overTime) {
    shouldPlay = false;
  }
  if (!props.focus && !props.overTime) {
    shouldPlay = false;
  }

  const playerStatusClassName = css`
    height: calc(100vh - 64px);
    width: 100vw;
    max-width:100%;
    max-height:100%;
  `

  return (
    <div className={playerStatusClassName}>
      <YoutubePlayer vid={youtubeVid} shouldPlay={shouldPlay}/>
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
            border-radius: 10px
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