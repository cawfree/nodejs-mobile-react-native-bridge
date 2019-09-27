const { channel } = require('rn-bridge');

const TAG = 'NodeJsBridge';

const sendMessage = (type = undefined, id = null, data = undefined) => {
  if (typeof type === 'string') {
    return channel
      .send(
        {
          $: {
            type,
            id,
          },
          data,
        },
      );
  }
  return sendError(
    id,
    `Expected string type, encountered ${typeof type}.`,
  );
};

const onMessage = (message) => {
};

const sendInit = () => sendMessage(
  `${TAG}/init`,
  null,
  'hello!',
);

const sendError = (
  id = null,
  e,
) => sendMessage(
  `${TAG}/error`,
  id,
  e,
);

//channel.on(
//  'message',
//  (message) => {
//    if (typeof message !== 'object') {
//
//    }
//  },
//);

sendInit();

// XXX: Respects real objects!
//channel.send(
//  {
//    x: 2,
//  },
//);
