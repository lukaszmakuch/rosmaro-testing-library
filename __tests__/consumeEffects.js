import {testFlow, consumeEffects} from './../src';
import {range} from 'ramda';

const model = ({state = 0, action}) => {
  switch (action.type) {
    case 'CAUSE_EFFECT':
      return {state, result: {effect: action.effect}};
    default:
      return {state};
  }
};

test('testing a stateful flow', () => {

  testFlow({
    model,
    initialTestContext: {},
    flow: [

      // No effects to consume.
      consumeEffects(effects => expect(effects).toEqual([])),

      // Case 3 effects.
      {feed: {type: 'CAUSE_EFFECT', effect: {type: 'FIRST'}}},
      {feed: {type: 'CAUSE_EFFECT', effect: {type: 'SECOND'}}},
      {feed: {type: 'CAUSE_EFFECT', effect: {type: 'THIRD'}}},

      // The 3 effects caused above.
      consumeEffects(effects => expect(effects).toEqual([
        {type: 'FIRST'},
        {type: 'SECOND'},
        {type: 'THIRD'},
      ])),

      // No new effects to consume.
      consumeEffects(effects => expect(effects).toEqual([])),

    ]
  });

});
