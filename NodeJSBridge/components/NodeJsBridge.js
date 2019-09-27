import React from 'react';
import PropTypes from 'prop-types';
import NodeJs from 'nodejs-mobile-react-native';
import uuidv4 from 'uuid/v4';

import {Alert} from 'react-native';

const TAG = 'NodeJsBridge';

class NodeJsBridge extends React.Component {
  createApi = (api, requests, sendMessage) => api
    .reduce(
      (obj, func) => ({
        ...obj,
        [func]: function() {
          const args = arguments;
          const id = uuidv4();
          return new Promise(
            (resolve, reject) => {
              requests[id] = [resolve, reject];
              return sendMessage(
                `${TAG}/exec`,
                id,
                {
                  func,
                  args,
                },
              );
            },
          );
        },
      }),
      {},
    );
  sendMessage = (type = undefined, id = null, data = undefined) => {
    if (typeof type === 'string') {
      return NodeJs
        .channel
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
    throw new Error(
      `Expected string type, encountered ${typeof type}.`,
    );
  };
  onMessage = (message, script, requests, onHandleBridge) => {
    const {
      $: {
        type,
        id,
      },
      data,
    } = message;
    switch (type) {
      case `${TAG}/init`:
        return this
          .sendMessage(
            `${TAG}/load`,
            null,
            script,
          );
      case `${TAG}/result`:
        const [ resolve ] = requests[id] || [];
        if (!!resolve) {
          delete requests[id];
          return resolve(
            data,
          );
        }
        throw new Error(
          `Encountered an orphaned result!`,
        );
      case `${TAG}/error`:
        if (id !== null && id !== undefined) {
          const [ unused, reject ] = requests[id] || [];
          if (!!reject) {
            delete requests[id];
            return reject(
              new Error(
                data,
              ),
            );
          } 
        }
        throw new Error(
          data,
        );
      case `${TAG}/api`:
        return onHandleBridge(
          this
            .createApi(
              data,
              requests,
              this.sendMessage,
            ),
        );
      default:
        throw new Error(
          `Encountered unrecognized type, "${type}".`,
        );
    }
  }; 
  UNSAFE_componentWillMount() {
    const {
      script,
      onHandleBridge,
    } = this.props;
    if (typeof script !== 'string') {
      throw new Error(
        `The 'script' prop is required for the NodeJsBridge.`,
      );
    }
    NodeJs.start(
      'nodejs-mobile-react-native-bridge.js',
    );
    const requests = {};
    NodeJs
      .channel
      .addListener(
        'message',
        (message) => {
          if (typeof message === 'object') {
            const { $ } = message;
            if (typeof $ === 'object') {
              const { type } = $;
              if (typeof type === 'string') {
                return this
                  .onMessage(
                    message,
                    script,
                    requests,
                    onHandleBridge,
                  );
              }
              throw new Error(
                `Expected string type, encountered ${typeof type}.`,
              );
            }
            throw new Error(
              `Expected object $, encountered ${typeof $}.`,
            );
          }
          throw new Error(
            `Expected object message, encountered ${typeof message}.`,
          );
        },
        this,
      );
  }
  UNSAFE_componentWillUnmount() {

  }
  render() {
    return (
      <React.Fragment
      />
    );
  }
}

NodeJsBridge.propTypes = {
  script: PropTypes.string.isRequired,
  onHandleBridge: PropTypes.func,
};

NodeJsBridge.defaultProps = {
  onHandleBridge: bridge => null,
};

export default NodeJsBridge;
