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

## consumeEffects

Every time an action causes some effects, they are stored in the testContext.
This is a helper to build a step that allows to verify the recently returned effects and then remove them from the list of recent effect.

```javascript
import {consumeEffects} from 'rosmaro-testing-library';
// ...

consumeEffects(effects => expect(effects).toEqual([
  {type: 'FIRST'},
  {type: 'SECOND'},
  {type: 'THIRD'},
])),

```

## makeTreeRunner

If you prefer a tree structure than over a list of steps, you may find this function useful.

For example, instead of writing this:
```javascript
test('root > finished branch 1A > get something extra', () => configuredTestFlow([
  rootStep,
  branch1A,
  finishBranch1,
  extraFor1A,
]);

test('root > finished branch 1B', () => configuredTestFlow([
  rootStep,
  branch1B,
  finishBranch1,
]);

test('root > Oops! Branch 1B failed!', () => configuredTestFlow([
  rootStep,
  branch1B,
  failBranch1,
]);
```

You may write this:
```javascript
import {makeTreeRunner} from 'rosmaro-testing-library';

const tree = makeTreeRunner()(
  (label, steps) => test(label, () => configuredTestFlow(steps))
);

tree(
  ['root', rootStep, [
    [branch1A, [
      ['finished branch 1A', finishBranch1, [
        ['get something extra', extraFor1A]
      ]]
    ]],
    [branch1B, [
      ['finished branch 1B', finishBranch1],
      ['Oops! Branch 1B failed!', failBranch1]
    ]]
  ]]
);

```

Where `configuredTestFlow` is for example something like this:
```javascript
import {testFlow} from 'rosmaro-testing-library';

const initialTestContext = {myInitial: 'testContext'};

const model = rosmaro({graph: myGraph, bindings: myBindings});

export const configuredTestFlow = flow => testFlow({
  model,
  initialTestContext,
  flow
});
```

## Blog posts

- [Testing the TodoMVC app](https://lukaszmakuch.pl/post/testing-the-todomvc-app)