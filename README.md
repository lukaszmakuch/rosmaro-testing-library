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

# Testing user flows

The snippet:
```javascript
import {testFlow} from 'rosmaro-testing-library';

testFlow({
 model,
 initialContext: {valueToAdd: 42},
 flow: [

   {
     action: () => ({type: 'READ'}),
     verify: ({result, context}) => {
       verify({afterReadingForTheFirstTime: {result, context}});
       return {valueToAdd: context.valueToAdd};
     },
   },

   [[[{
     action: ({valueToAdd}) => ({type: 'ADD', value: valueToAdd}),
     verify: ({result, context}) => {
       verify({addingTheFirstValue: {result, context}});
       return {valueToAdd: context.valueToAdd + 1};
     },
   }]]],

   [[{
     action: ({valueToAdd}) => ({type: 'ADD', value: valueToAdd}),
     verify: ({result, context}) => {
       verify({addingTheSecondValue: {result, context}});
     },
   },

   {action: () => ({type: 'READ'})}]],

   {
     action: () => ({type: 'READ'}),
     verify: ({result, context}) => {
       verify({afterReadingForTheSecondTime: {result, context}});
     },
   },

 ]
});
```

The flow is an array of objects.

Each object is a step.

A step consits of:
- an action factory
- result verifying function

The action factory takes a test context object. It is not the context of the Rosmaro model under test. It's just an object where you can store data userful for testing.

The result verifying function takes the result of calling the Rosmaro model and the test context. It's job is to ensure the result meets the requirements. It may return a new test context value.

