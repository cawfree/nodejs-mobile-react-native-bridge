# nodejs-mobile-react-native-bridge
A high-level wrapper interface to Node.js for React Native.

## 🤔 So... what is this?

When running intensive computation in your JavaScript thread, you run the risk of dropping render frames, which causes your app to respond slowly animate less smoothly and feel sluggish. This happens because execessive computational overhead can diminish your ability to reach the next render frame, which ideally should operate at a frequency of 60fps.

Luckily, [JaneaSystems](https://github.com/JaneaSystems) have open sourced a [native mobile execution container](https://github.com/JaneaSystems/nodejs-mobile-react-native) for Node.js which operates concurrently to your traditional JavaScript render thread. This library is available for both iOS and Android, and provides implementors with the ability to diversify their execution logic by delegating stateless computation for parallel execution. This helps promote more advantageous utilisation of the runtime hardware, whilst simultaneously unburdening your render thread.

The mobile Node.js environment can be interacted with using a simple bidirectional protocol, `sendMessage` and `onMessage`, which communicates from React to the native container and vice-versa. However, this mechanism for communication often proves to be too low level, can easily swallow exceptions, requires manual synchronization and normally demands the implementation of a bespoke protocol.

This library serves as an abstraction layer to avoid these concerns, by defining an interface which mirrors the functions exported by the native module. These functions are promisified and mapped to a native `bridge` object, which manages lower level synchronization. This approach helps treat the remote Node.js runtime as if it were just another part of your application.

## 🚀 Getting Started

Using [`npm`]():

```sh
npm install --save nodejs-react-native-bridge
```

Using [`yarn`]():

```sh
yarn add nodejs-mobile-react-native-bridge
```

This will install the file `nodejs-mobile-react-native-bridge.js` to your `nodejs-assets/nodejs-project`directory installed by `nodejs-mobile-react-native`.

## ✍️ Example

**path/to/your/App.js**

```javascript
import React from 'react';
import NodeJsBridge from 'nodejs-mobile-react-native-bridge';

export default () => (
  <NodeJsBridge
    script="sample-main.js"
    onHandleBridge={({ hello }) => hello('world')
      .then(console.log) // "hello, world!"
      .catch(console.warn)}
    
  />
);
```

**path/to/your/nodejs-assets/nodejs-project/sample-main.js**

```javascript
module.exports = {
  hello: str => `hello, ${str}!`,
};
```

This file serves as the entry-point to your decoupled logic. Each function exported by the file becomes available as promisified function via the `bridge` object returned via the `onHandleBridge` callback prop, which allows you to easily interact with your threaded Node.js project.

## ✌️  License
[MIT](https://opensource.org/licenses/MIT)
