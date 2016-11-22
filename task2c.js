import express from 'express';
import cors from 'cors';
import bunyan from 'bunyan';

global._DEV_ = true;

const log = bunyan.createLogger({
  name: 'app',
  src: _DEV_,
  level: 'trace',
});

const app = express();
app.use(cors());

function canonize(url) {
  const re = new RegExp('(http:\/\/|https:\/\/|\/\/)?(www\.|@)?([a-z]*\.[a-z]{2,4}\/|xn--80adtgbbrh1bc.xn--p1ai\/)?(@)?([a-z]*[\._]?[a-z]*)');
  const username = `@${url.match(re)[5]}`;
  log.info(`RegExp: ${url.match(re)}`);
  return username;
}

app.get('/', async (req, res, next) => {
  log.info(`Qeury: ${req.query.username}`);
  let url = req.query.username;
  let username = canonize(url);
  res.send(username);
  next();
});

app.listen(3000, () => {
  log.trace('Task2c started on port 3000!');
});
