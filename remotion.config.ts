// Remotion exposes Config at runtime; keep this file permissive for TS typecheck.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {Config} = require('remotion');

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);