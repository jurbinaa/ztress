import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactPlayer from 'react-player';

const playerRef = React.createRef();
const element = React.createElement(ReactPlayer, { ref: playerRef, url: 'https://www.youtube.com/watch?v=UfcAVejslrU' });

console.log('$$typeof', ReactPlayer.$$typeof.toString());
