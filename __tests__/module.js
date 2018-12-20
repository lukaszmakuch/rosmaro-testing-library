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
      {feed: {type: 'ADD', value: 1}},

      // Verify the result.
      {
        feed: {type: 'READ'},
        consume: ({result}) => {
          verify({afterAdding1: {result}})
        }
      },

      // Action based on the context. (in an array)
      [({context}) => ({
        feed: {type: 'ADD', value: context.valueToAdd}
      })],

      // Verify the result. (in two arrays)
      [[({
        feed: {type: 'READ'},
        consume: ({result}) => {
          verify({afterAddingValueFromTheContext: {result}})
        }
      })]],

      // Update the test context.
      ({context}) => ({
        feed: {type: 'READ'},
        consume: ({result}) => ({
          context: {
            ...context,
            valueToAdd: result + context.valueToAdd
          }
        })
      }),

      // Add the value from the context.
      ({context}) => ({
        feed: {type: 'ADD', value: context.valueToAdd}
      }),

      // Verify the result.
      ({
        feed: {type: 'READ'},
        consume: ({result}) => {
          verify({afterUpdatingTheContext: {result}})
        }
      }),

      // Just one next step.
      ({
        feed: {type: 'ADD', value: 0},
        consume: () => ({
          step: {
            feed: {type: 'ADD', value: 1},
          }
        })
      }),

      // Dynamic steps generated based on the result and context.
      ({
        feed: {type: 'READ'},
        consume: ({result}) => {
          const dynamic = ({context}) => ({
            feed: {type: 'ADD', value: context.valueToAdd},
            consume: ({result}) => {
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

      // Verify the result.
      ({
        feed: {type: 'READ'},
        consume: ({result}) => {
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
