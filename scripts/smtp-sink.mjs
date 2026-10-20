// Disposable local SMTP sink for tests (m1-012). Node built-ins only.
//
// Accepts mail on 127.0.0.1 and keeps it; it never relays anything, so test
// notifications cannot reach a real mailbox. Used in-process by
// scripts/form-ops-test.mjs, or standalone for manual and browser checks:
//
//   node scripts/smtp-sink.mjs --port 2525 --out <directory>
//
// writes each received message to <directory> as a time-stamped .eml file. Point
// the app at it with APOS_SMTP_HOST=127.0.0.1, APOS_SMTP_PORT=2525 and
// APOS_SMTP_REQUIRE_TLS=0 (allowed for loopback hosts only).
//
// Modes (`sink.mode`): 'accept' (default); 'reject-auth' answers AUTH with
// 535, as a server does for wrong credentials. Credentials sent with AUTH are
// checked against nothing and never stored or printed.

import { mkdir, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function startSmtpSink({ port = 0, onMessage } = {}) {
  const sink = {
    mode: 'accept',
    messages: [],
    port: null,
    close: null
  };
  const sockets = new Set();
  const server = net.createServer(socket => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
    socket.on('error', () => {});
    let buffer = '';
    let state = 'command';
    let envelope = {
      from: null,
      to: []
    };
    let data = [];
    const reply = line => socket.write(`${line}\r\n`);
    reply('220 smtp-sink ESMTP test sink');
    socket.on('data', chunk => {
      buffer += chunk.toString('utf8');
      let index;
      while ((index = buffer.indexOf('\r\n')) !== -1) {
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 2);
        handle(line);
      }
    });
    function handle(line) {
      if (state === 'data') {
        if (line === '.') {
          const message = {
            from: envelope.from,
            to: envelope.to,
            raw: data.join('\r\n')
          };
          sink.messages.push(message);
          onMessage?.(message);
          state = 'command';
          envelope = {
            from: null,
            to: []
          };
          data = [];
          return reply('250 2.0.0 queued in sink');
        }
        data.push(line.startsWith('..') ? line.slice(1) : line);
        return;
      }
      if (state === 'auth-plain' || state === 'auth-login-user') {
        state = state === 'auth-plain' ? 'command' : 'auth-login-pass';
        if (state === 'auth-login-pass') {
          return reply('334 UGFzc3dvcmQ6');
        }
        return authResult();
      }
      if (state === 'auth-login-pass') {
        state = 'command';
        return authResult();
      }
      const [ verb ] = line.split(' ');
      switch (verb.toUpperCase()) {
        case 'EHLO':
          return reply('250-smtp-sink\r\n250-8BITMIME\r\n250 AUTH PLAIN LOGIN');
        case 'HELO':
          return reply('250 smtp-sink');
        case 'AUTH': {
          const [ , mechanism, initial ] = line.split(' ');
          if (/^PLAIN$/i.test(mechanism)) {
            if (initial) {
              return authResult();
            }
            state = 'auth-plain';
            return reply('334 ');
          }
          if (/^LOGIN$/i.test(mechanism)) {
            state = 'auth-login-user';
            return reply('334 VXNlcm5hbWU6');
          }
          return reply('504 5.5.4 mechanism not supported');
        }
        case 'MAIL':
          envelope.from = line.replace(/^MAIL FROM:\s*/i, '').replace(/\s.*$/, '');
          return reply('250 2.1.0 ok');
        case 'RCPT':
          envelope.to.push(line.replace(/^RCPT TO:\s*/i, '').replace(/\s.*$/, ''));
          return reply('250 2.1.5 ok');
        case 'DATA':
          state = 'data';
          return reply('354 end with <CRLF>.<CRLF>');
        case 'RSET':
          envelope = {
            from: null,
            to: []
          };
          return reply('250 2.0.0 ok');
        case 'NOOP':
          return reply('250 2.0.0 ok');
        case 'QUIT':
          reply('221 2.0.0 bye');
          return socket.end();
        default:
          return reply('502 5.5.2 command not recognised');
      }
    }
    function authResult() {
      return sink.mode === 'reject-auth'
        ? reply('535 5.7.8 authentication credentials invalid')
        : reply('235 2.7.0 authentication succeeded');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  sink.port = server.address().port;
  sink.close = () => new Promise(resolve => {
    for (const socket of sockets) {
      socket.destroy();
    }
    server.close(() => resolve());
  });
  return sink;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = name => {
    const index = process.argv.indexOf(name);
    return index === -1 ? undefined : process.argv[index + 1];
  };
  const out = arg('--out');
  if (!out) {
    console.error('Usage: node scripts/smtp-sink.mjs --port 2525 --out <directory>');
    process.exit(2);
  }
  await mkdir(out, { recursive: true });
  let count = 0;
  const sink = await startSmtpSink({
    port: Number(arg('--port') || 2525),
    onMessage: message => {
      count++;
      // Time-stamped, so a restarted sink never overwrites earlier messages.
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const file = path.join(out, `${stamp}-${String(count).padStart(4, '0')}.eml`);
      writeFile(file, message.raw).then(() => console.log(`received message ${count} -> ${file}`));
    }
  });
  console.log(`SMTP sink listening on 127.0.0.1:${sink.port}; messages go to ${out}`);
}
