import YouTube from 'react-youtube';
import { css } from '@emotion/css';
import { useEffect, useRef } from 'react';

export function YoutubePlayer(props) {
  const playerRef = useRef(null);
  const shouldPlay = props.shouldPlay;
  const parsed = props.parsed;

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  };

  // Configure for playlist or single video
  if (parsed && parsed.type === 'playlist') {
    opts.playerVars.listType = 'playlist';
    opts.playerVars.list = parsed.listId;
  } else if (parsed && parsed.type === 'video') {
    opts.playerVars.loop = 1;
    opts.playerVars.playlist = parsed.vid;
  }

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

  const videoId = parsed && parsed.type === 'video' ? parsed.vid : undefined;

  return (
      <YouTube className={
        css`
          height: 100%;
          width: 100%;
          position: relative;
        `
      } ref={playerRef} videoId={videoId} opts={opts} />
  );

}
