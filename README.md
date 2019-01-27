# rosmaro-testing-library

A [Rosmaro](https://rosmaro.js.org) model is a function of state and action that gives a new state and some result:
```javascript
({state, action}) => ({state, result})
```

This is a library to test such functions.

Installing the library:
```
npm i --save-dev rosmaro-testing-library
```

## testFlow
This is the most important function when it comes to testing Rosmaro models. It compose a test of a flow out of single steps.
```javascript
import {testFlow} from 'rosmaro-testing-library';

testFlow({
  // The Rosmaro model function.
  model,
  // A bag of data useful for the test.
  // It is not the context of the Rosmaro model.
  initialTestContext: {valueToAdd: 4},
  // An array of steps.
  flow: [

    // The first step defined as a function of the test context.
    ({testContext}) => ({
      // The *feed* property is the action the model is going to consume.
      feed: {type: 'ADD', value: testContext.valueToAdd},
      // *result* is what the model returned.
      consume: ({result}) => {
        // We can make assertions here.
        expect(state).toEqual(4);
        const newTestContext = {...testContext, valueToAdd: 11};
        return {
          // We can also return an updated version of the testContext.
          testContext: newTestContext,
          // Optionally, we can return the next {feed, consume} object
          // describing the next step.
          // It is useful if the number of steps varies
          // depending on the result of the model call.
          step: {
            feed: {type: 'ADD', value: newTestContext.valueToAdd}
          }
        };
      }
    }),

    // Others steps...

  ]
});
```

For a more detailed description of this function, please check out the unit tests.

## consumeActionsWithEffects

This is especially useful if we want to feed the model with actions build based on the result of calling another action. 

An example may be a `{type: 'RENDER'}` action which results is some UI. After asserting that the UI consists of the expected data, we would also like to make sure that it somehow dispatches the proper actions back to the model. Some of the actions may cause (return) `{type: 'DISPATCH'}` effects. This function handles all the dispatched actions recursively.

```javascript
import {consumeActionsWithEffects} from 'rosmaro-testing-library';
// ...

{
  feed: {type: 'RENDER'},
  consume: ({result: {UI}}) => {
    // Just an example how the UI may return an action to dispatch.
    const actionToDispatch = UI.click();
    return {
      step: consumeActionsWithEffects([actionToDispatch])
    };
  }
},
```

## Blog posts

- [Testing the TodoMVC app](https://lukaszmakuch.pl/post/testing-the-todomvc-app)