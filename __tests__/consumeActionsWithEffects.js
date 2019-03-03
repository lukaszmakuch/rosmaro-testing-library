import {testFlow, consumeActionsWithEffects, assertUnconsumedEffects} from './../src';
import {lensProp, over, append} from 'ramda';

const addTriggeredAction = ({state, action}) =>
  over(lensProp('triggered'), append(action), state);

const model = ({state = {triggered: []}, action}) => {

  switch (action.type) {

    case 'start':
      return {
        result: {action: {type: 'A'}}
      };

    case 'A':
      return {
        result: {
          effect: {type: 'DISPATCH', action: {type: 'B'}}
        },
        state: addTriggeredAction({state, action: 'A'})
      };

    case 'B':
      return {
        result: {
          effect: [
            {type: 'DISPATCH', action: {type: 'C'}},
            {type: 'THE_FIRST_OF_OTHER_EFFECTS'},
          ]
        },
        state: addTriggeredAction({state, action: 'B'})
      };

    case 'C':
      return {
        result: {
          effect: [
            {type: 'DISPATCH', action: {type: 'D1.1'}},
            {type: 'DISPATCH', action: {type: 'D2.1'}},
            {type: 'DISPATCH', action: {type: 'D3.1'}},
          ]
        },
        state: addTriggeredAction({state, action: 'C'})
      };

    case 'D1.1':
      return {
        result: {
          effect: [
            {type: 'DISPATCH', action: {type: 'D1.2.1.1'}},
            {type: 'DISPATCH', action: {type: 'D1.2.2'}},
            {type: 'THE_SECOND_OF_OTHER_EFFECTS'},
          ]
        },
        state: addTriggeredAction({state, action: 'D1.1'})
      };


      case 'D1.2.1.1':
        return {
          result: {
            effect: [
              {type: 'DISPATCH', action: {type: 'D1.2.1.2'}},
            ]
          },
          state: addTriggeredAction({state, action: 'D1.2.1.1'})
        };

      case 'D1.2.1.2':
        return {
          result: {
            effect: [
              {type: 'THE_THIRD_OF_OTHER_EFFECTS'},
            ]
          },
          state: addTriggeredAction({state, action: 'D1.2.1.2'})
        };

      case 'D1.2.2':
        return {
          result: {
            effect: []
          },
          state: addTriggeredAction({state, action: 'D1.2.2'})
        };

    case 'D2.1':
      return {
        result: {},
        state: addTriggeredAction({state, action: 'D2.1'})
      };

    case 'D3.1':
      return {
        result: {},
        state: addTriggeredAction({state, action: 'D3.1'})
      };

    case 'READ_TRIGGERED': 
      return {
        result: state.triggered
      };

    default:
      return {state};
  }
};

test('consuming actions with effects', () => {
  testFlow({
    model,
    flow: [

      assertUnconsumedEffects(effects => expect(effects).toEqual([])),

      {
        feed: {type: 'start'},
        consume: ({result: {action}}) => {
          return {
            step: consumeActionsWithEffects([action])
          };
        }
      },

      {
        feed: {type: 'READ_TRIGGERED'},
        consume: ({result, testContext}) => {
          expect(result).toEqual([
            'A',
            'B',
            'C',
            'D1.1',
            'D1.2.1.1',
            'D1.2.1.2',
            'D1.2.2',
            'D2.1',
            'D3.1'
          ]);
        }
      },

      assertUnconsumedEffects(effects => expect(effects).toEqual([
        {type: 'THE_FIRST_OF_OTHER_EFFECTS'},
        {type: 'THE_SECOND_OF_OTHER_EFFECTS'},
        {type: 'THE_THIRD_OF_OTHER_EFFECTS'}
      ])),

      assertUnconsumedEffects(effects => expect(effects).toEqual([])),

    ]
  });
});
