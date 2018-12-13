import testFlow from './../src';

const model = ({state = 0, action}) => {
  switch (action.type) {
    case 'INCREMENT':
      return {state: state + 1};
    case 'DECREMENT':
      return {state: state - 1};
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
    flow: [

      {
        action: {type: 'READ'},
        verifyResult: ({result}) => {
          verify({afterReadingForTheFirstTime: result});
        },
      },

      {
        action: {type: 'INCREMENT'},
        verifyResult: ({result}) => {
          verify({afterIncrementingForTheFirstTime: result});
        },
      },

      {action: {type: 'INCREMENT'}},

      {
        action: {type: 'READ'},
        verifyResult: ({result}) => {
          verify({afterReadingForTheSecondTime: result});
        },
      },

    ]
  });

  expect(verifyArgs).toEqual([
    {afterReadingForTheFirstTime: 0},
    {afterIncrementingForTheFirstTime: undefined},
    {afterReadingForTheSecondTime: 2},
  ]);

});
