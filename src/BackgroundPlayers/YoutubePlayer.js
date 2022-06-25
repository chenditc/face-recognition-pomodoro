import YouTube from 'react-youtube';
import { css } from '@emotion/css';
import { useEffect, useRef } from 'react';

export function YoutubePlayer(props) {
  const playerRef = useRef(null);
  const shouldPlay = props.shouldPlay;

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  };

  useEffect(() => {
    if (!playerRef.current) return;
    console.log(playerRef.current.internalPlayer);
    if (shouldPlay) {
      playerRef.current.internalPlayer.playVideo()
    }
    else {
      playerRef.current.internalPlayer.pauseVideo()
    }
  }, [shouldPlay])

  return (
      <YouTube className={
        css`
          height: 100%;
          width: 100%;
          position: relative;
        `
      } ref={playerRef} videoId={props.vid} opts={opts} />
  );

}