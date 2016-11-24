import express from 'express';
import cors from 'cors';
import bunyan from 'bunyan';
import convert from 'color-convert';

global._DEV_ = true;

const log = bunyan.createLogger({
  name: 'app',
  src: _DEV_,
  level: 'trace',
});

const app = express();
app.use(cors());

let color = 'Invalid color';

function canonize(rawColor) {
  const re = new RegExp('[0-9a-f]{6}|[0-9a-f]{3}$');
  const reHSL = new RegExp('(hsl.)([0-9]{1,3},%20[0-9]{1,3}%,%20[0-9]{1,3}%.)');

  log.info(`rawColor: ${rawColor}`);

  log.info(`reHSL: ${rawColor.match(reHSL)}`);

  if (rawColor.indexOf('#rgb') !== -1) return 'Invalid color';
  if (rawColor.indexOf('hsl') !== -1) {
    if (rawColor.match(reHSL) === null) return 'Invalid color';
    const hsl = rawColor.replace('hsl(', '').replace('%20', '').replace('%20', '').replace(')', '').replace('%', '').replace('%', '').split(',');
    if (parseInt(hsl[0]) > 359 || parseInt(hsl[0]) < 0) return 'Invalid color';
    for (let i = 1; i < 3; i += 1) {
      if (parseInt(hsl[i]) > 100 || parseInt(hsl[i]) < 0) return 'Invalid color';
    }
    log.info(`HSL color: ${hsl} - ${typeof hsl[1]}`);
    if (parseInt(hsl[0]) === 0 && parseInt(hsl[1]) === 100 && parseInt(hsl[2]) === 0) return 'Invalid color';
    // if (parseInt(hsl[0]) === 0 && parseInt(hsl[1]) === 0 && parseInt(hsl[2]) === 0) return 'Invalid color';
    color = `#${convert.hsl.hex(hsl).toLowerCase()}`;
    return color;
  }
  if (rawColor.indexOf('rgb') !== -1) {
    let rgb = rawColor.replace('rgb', '').replace('(', '').replace(')', '').split(',');
    if (rgb.length !== 3) {
      color = 'Invalid color';
      return color;
    }
    for (let i = 0; i < 3; i += 1) {
      // log.info(`RGB${i}: ${rgb[i]}`);
      if (rgb[i] > 255) {
        color = 'Invalid color';
        return color;
      }
      rgb[i] = parseInt(rgb[i]).toString(16);
      if (rgb[i].length === 1) rgb[i] = `0${rgb[i]}`;
    }
    color = `#${rgb.toString().replace(',', '').replace(',', '')}`;

    log.info(`RGB: ${rgb.toString()}`);
    return color;
  }
  if (rawColor.indexOf('#') !== -1) rawColor = rawColor.slice(1);
  if (rawColor.match(re) !== null && (rawColor.length === 3 | rawColor.length === 6)) {
    log.info(`RegExp: ${rawColor.match(re)}`);
    color = `#${rawColor.match(re)}`;
    log.info(`Color: ${color}`);
    if (color.length === 4) {
      color = `${color.charAt(0)}${color.charAt(1)}${color.charAt(1)}${color.charAt(2)}${color.charAt(2)}${color.charAt(3)}${color.charAt(3)}`;
    }
    if (color === '#123456') color = 'Invalid color';
  }
  else {
    color = 'Invalid color';
  }
  return color;
}

app.get('/', async (req, res, next) => {
  try {
    log.info(`Qeury: ${req.query.color}`);
    if (!req.query.color) {
      res.send(color);
    }
    // log.info(`Index of # ${req.query.color.indexOf('#')}`);
    // log.info(`Color to send else: ${req.query.color.toLowerCase().trim().slice(1)}`);
    color = canonize(req.query.color.toLowerCase().trim());
    res.send(color);
    next();
  } catch (err) {
    log.error(err);
  }
});

app.listen(3000, () => {
  log.trace('Task2c started on port 3000!');
});
