import React from 'react';
import PropTypes from 'prop-types';
import NodeJs from 'nodejs-mobile-react-native';
import uuidv4 from 'uuid/v4';

import {Alert} from 'react-native';

const TAG = 'NodeJsBridge';

class NodeJsBridge extends React.Component {
  static sendMessage = (type = undefined, id = null, data = undefined) => {
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
  static onMessage = (message, script) => {
    const {
      $: {
        type,
        id,
      },
      data,
    } = message;
    switch (type) {
      case `${TAG}/init`:
        return NodeJsBridge
          .sendMessage(
            `${TAG}/load`,
            null,
            script,
          );
      case `${TAG}/error`:
        if (id !== null && id !== undefined) {
          return Alert.alert('should propagate error here!');
        }
        throw new Error(
          data,
        );
      default:
        throw new Error(
          `Encountered unrecognized type, "${type}".`,
        );
    }
  }; 
  UNSAFE_componentWillMount() {
    const { script } = this.props;
    if (typeof script !== 'string') {
      throw new Error(
        `The 'script' prop is required for the NodeJsBridge.`,
      );
    }
    NodeJs.start(
      'nodejs-mobile-react-native-bridge.js',
    );
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
                return NodeJsBridge
                  .onMessage(
                    message,
                    script,
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
};

NodeJsBridge.defaultProps = {

};

export default NodeJsBridge;
