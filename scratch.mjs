import ReactPlayer from 'react-player';
console.log('ReactPlayer type:', typeof ReactPlayer);
console.log('Keys:', Object.keys(ReactPlayer));
if (ReactPlayer.default) {
  console.log('Default keys:', Object.keys(ReactPlayer.default));
}
