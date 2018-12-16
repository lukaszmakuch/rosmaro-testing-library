import {testFlow} from './../src';
import {range} from 'ramda';

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
    initialContext: {valueToAdd: 7},
    flow: [

      [[[[
        [({context}) => range(0, context.valueToAdd - 1).map(() => ([
          () => ({
            action: ({valueToAdd}) => ({type: 'ADD', value: 1}),
            verify: ({result, context}) => {
              verify({addingFromAMap: {result, context}});
              return {valueToAdd: context.valueToAdd};
            }
          })
        ]))],
        {
          action: ({valueToAdd}) => ({type: 'ADD', value: 1}),
          verify: ({result, context}) => {
            verify({addingOutisdeTheMap: {result, context}});
            return {valueToAdd: context.valueToAdd + 1};
          }
        }
      ]]]],

      {
        action: () => ({type: 'READ'}),
        verify: ({result, context}) => {
          verify({afterReadingForTheFirstTime: {result, context}});
          return {valueToAdd: context.valueToAdd};
        },
      },

      [[{
        action: ({valueToAdd}) => ({type: 'ADD', value: valueToAdd}),
        verify: ({result, context}) => {
          verify({addingTheSecondTime: {result, context}});
        },
      },

      {action: () => ({type: 'READ'})}]],

      {
        action: () => ({type: 'READ'}),
        verify: ({result, context}) => {
          verify({reading: {result, context}});
        },
      },

    ]
  });

  expect(verifyArgs).toEqual([
    {addingFromAMap: {result: undefined, context: {valueToAdd: 7}}},
    {addingFromAMap: {result: undefined, context: {valueToAdd: 7}}},
    {addingFromAMap: {result: undefined, context: {valueToAdd: 7}}},

    {addingFromAMap: {result: undefined, context: {valueToAdd: 7}}},
    {addingFromAMap: {result: undefined, context: {valueToAdd: 7}}},
    {addingFromAMap: {result: undefined, context: {valueToAdd: 7}}},
    
    {addingOutisdeTheMap: {result: undefined, context: {valueToAdd: 7}}},

    {afterReadingForTheFirstTime: {result: 7, context: {valueToAdd: 8}}},
    {addingTheSecondTime: {result: undefined, context: {valueToAdd: 8}}},
    {reading: {result: 15, context: {valueToAdd: 8}}},
  ]);

});
