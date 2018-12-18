import {testFlow} from './../src';
import {range} from 'ramda';

const model = ({state = 0, action}) => {
  switch (action.type) {
    case 'ADD':
      return {state: state + action.value, result: {justAdded: action.value}};
    case 'READ':
      return {state, result: state};
    default:
      return {state};
  }
};

test('testing a stateful flow', () => {

  let verifyArgs = [];
  const verify = arg => verifyArgs.push(arg);

  testFlow({
    model,
    initialContext: {valueToAdd: 4},
    flow: [

      // Simply an action.
      {action: {type: 'ADD', value: 1}},

      // Verify result.
      {
        action: {type: 'READ'},
        verify: ({result}) => {
          verify({afterAdding1: {result}})
        }
      },

      // Action based on the context. (in an array)
      [({context}) => ({
        action: {type: 'ADD', value: context.valueToAdd}
      })],

      // Verify result. (in two arrays)
      [[({
        action: {type: 'READ'},
        verify: ({result}) => {
          verify({afterAddingValueFromTheContext: {result}})
        }
      })]],

      // Update the test context.
      ({context}) => ({
        action: {type: 'READ'},
        next: ({result}) => ({
          context: {
            ...context,
            valueToAdd: result + context.valueToAdd
          }
        })
      }),

      // Add the value from the context.
      ({context}) => ({
        action: {type: 'ADD', value: context.valueToAdd}
      }),

      // Verify result.
      ({
        action: {type: 'READ'},
        verify: ({result}) => {
          verify({afterUpdatingTheContext: {result}})
        }
      }),

      // One next step.
      ({
        action: {type: 'ADD', value: 0},
        next: {
          step: {
            action: {type: 'ADD', value: 1},
          }
        }
      }),

      // Dynamic steps generated based on the result and context.
      ({
        action: {type: 'READ'},
        next: ({result}) => {
          const dynamic = ({context}) => ({
            action: {type: 'ADD', value: context.valueToAdd},
            next: ({result}) => {
              if (result.justAdded < 11) {
                return {
                  step: dynamic,
                  context: {...context, valueToAdd: context.valueToAdd + 1}
                };
              }
            }
          });

          return {step: dynamic};
        }
      }),

      // Verify result.
      ({
        action: {type: 'READ'},
        verify: ({result}) => {
          verify({afterTheDynamicStep: {result}})
        }
      }),

    ]
  });

  expect(verifyArgs).toEqual([

    {afterAdding1: {result: 1}},
    
    {afterAddingValueFromTheContext: {result: 5}},

    {afterUpdatingTheContext: {result: 14}},

    {afterTheDynamicStep: {result: 45}},

  ]);

});
