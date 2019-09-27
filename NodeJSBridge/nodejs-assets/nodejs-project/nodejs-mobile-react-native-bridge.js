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
  const {
    $: {
      type,
      id,
    },
    data,
  } = message;
  switch (type) {
    case `${TAG}/load`: 
      let src;
      try {
        src = require(data);
      } catch (e) {
        return sendError(
          id,
          `Failed to load script "${data}". Please make sure it exists under your nodejs-project directory, and that it is free of syntax errors.`,
        );
      }
      if (typeof src === 'object') {
        return sendError(
          id,
          'success',
        );
      }
      return sendError(
        id,
        `require('${data}') did not export an object, which is required by the NodeJsBridge.`,
      );
    default:
      return sendError(
        id,
        `Encountered unrecognized type "${type}".`,
      );
  }
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

channel.on(
  'message',
  (message) => {
    if (typeof message === 'object') {
      const { $ } = message;
      if (typeof $ === 'object') {
        const { id, type } = $;
        if (typeof type === 'string') {
          return onMessage(
            message,
          );
        }
        return sendError(
          id,
          `Expected string type, encountered ${typeof type}.`,
        );
      }
      return sendError(
        null,
        `Expected object $, encountered ${typeof $}.`,
      );
    }
    return sendError(
      null,
      `Expected object message, encountered ${typeof message}.`,
    );
  },
);

sendInit();
