import testFlow from './../src';

const model = ({state = 0, action}) => {
  switch (action.type) {
    case 'ADD':
      return {state: state + action.value};
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
        action: () => ({type: 'READ'}),
        verify: ({result, context}) => {
          verify({afterReadingForTheFirstTime: {result, context}});
          return {valueToAdd: 42};
        },
      },

      {
        action: ({valueToAdd}) => ({type: 'ADD', value: valueToAdd}),
        verify: ({result, context}) => {
          verify({addingTheFirstValue: {result, context}});
          return {valueToAdd: context.valueToAdd + 1};
        },
      },

      {
        action: ({valueToAdd}) => ({type: 'ADD', value: valueToAdd}),
        verify: ({result, context}) => {
          verify({addingTheSecondValue: {result, context}});
        },
      },

      {action: () => ({type: 'READ'})},

      {
        action: () => ({type: 'READ'}),
        verify: ({result, context}) => {
          verify({afterReadingForTheSecondTime: {result, context}});
        },
      },

    ]
  });

  expect(verifyArgs).toEqual([
    {afterReadingForTheFirstTime: {result: 0, context: {}}},
    {addingTheFirstValue: {result: undefined, context: {valueToAdd: 42}}},
    {addingTheSecondValue: {result: undefined, context: {valueToAdd: 43}}},
    {afterReadingForTheSecondTime: {result: 85, context: {valueToAdd: 43}}},
  ]);

});
