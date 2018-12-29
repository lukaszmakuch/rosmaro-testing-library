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
    initialTestContext: {valueToAdd: 4},
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

      // Action based on the testContext. (in an array)
      [({testContext}) => ({
        feed: {type: 'ADD', value: testContext.valueToAdd}
      })],

      // Verify the result. (in two arrays)
      [[({
        feed: {type: 'READ'},
        consume: ({result}) => {
          verify({afterAddingValueFromTheTestContext: {result}})
        }
      })]],

      // Update the test testContext.
      ({testContext}) => ({
        feed: {type: 'READ'},
        consume: ({result}) => ({
          testContext: {
            ...testContext,
            valueToAdd: result + testContext.valueToAdd
          }
        })
      }),

      // Add the value from the testContext.
      ({testContext}) => ({
        feed: {type: 'ADD', value: testContext.valueToAdd}
      }),

      // Verify the result.
      ({
        feed: {type: 'READ'},
        consume: ({result}) => {
          verify({afterUpdatingTheTestContext: {result}})
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

      // Dynamic steps generated based on the result and testContext.
      ({
        feed: {type: 'READ'},
        consume: ({result}) => {
          const dynamic = ({testContext}) => ({
            feed: {type: 'ADD', value: testContext.valueToAdd},
            consume: ({result}) => {
              if (result.justAdded < 11) {
                return {
                  step: dynamic,
                  testContext: {...testContext, valueToAdd: testContext.valueToAdd + 1}
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
    
    {afterAddingValueFromTheTestContext: {result: 5}},

    {afterUpdatingTheTestContext: {result: 14}},

    {afterTheDynamicStep: {result: 45}},

  ]);

});
