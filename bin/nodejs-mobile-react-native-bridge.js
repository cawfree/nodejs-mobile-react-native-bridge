const { channel } = require('rn-bridge');

const TAG = 'NodeJsBridge';
var src = undefined;

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
    case `${TAG}/exec`:
      if (typeof data === 'object') {
        const { func, args } = data;
        return Promise
          .resolve()
          .then(
            function() {
              return src[func].apply(
                this,
                Object
                  .entries(args || {})
                  .sort(([ k1 ], [ k2 ]) => k1 - k2)
                  .map(([ k, v ]) => v),
              );
            },
          )
          .then(
            result => sendResult(
              id,
              result,
            ),
          )
          .catch(
            e => sendError(
              id,
              e.toString(),
            ),
          );
      }
      // TODO: respect id
      return sendError(
        id,
        `Expected object data, encountered ${typeof data}.`,
      );
    case `${TAG}/load`: 
      try {
        src = require(data);
      } catch (e) {
        return sendError(
          id,
          `Failed to load script "${data}". Please make sure it exists under your nodejs-project directory, and that it is free of syntax errors.`,
        );
      }
      if (typeof src === 'object') {
        return sendApi(
          id,
          Object
            .entries(src)
            .filter(([k, v]) => (typeof v === 'function'))
            .map(([k]) => k)
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
  null,
);

const sendApi = (id, api) => sendMessage(
  `${TAG}/api`,
  null,
  api,
);

const sendResult = (id, result) => sendMessage(
  `${TAG}/result`,
  id,
  result,
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
