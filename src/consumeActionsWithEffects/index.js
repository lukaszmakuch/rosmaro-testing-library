import {
  pipe,
  flatten,
  filter,
  propEq,
  map,
  groupBy,
  prop,
  complement,
  isNil,
  lensProp,
  set,
  view
} from 'ramda';

const unconsumedEffectsLens = lensProp('unconsumedEffects');

const dispatchOrUnconsumed = effect => effect.type === 'DISPATCH'
  ? 'dispatch' 
  : 'unconsumed';

const addUnconsumedEffects = (testContext, unconsumedEffects) => ({
  ...testContext,
  unconsumedEffects: filter(complement(isNil), flatten([
    testContext.unconsumedEffects,
    unconsumedEffects
  ]))
});

const consumeDispatchActionEffects = ({testContext}) => ({result: {effect = []}}) => {
  const effects = pipe(
    flatten,
    groupBy(dispatchOrUnconsumed)
  )([effect]);
  const dispatchActionEffects = effects.dispatch || [];

  return {
    step: dispatchActionEffects.map(({action}) => ({testContext}) => ({
      feed: action,
      consume: consumeDispatchActionEffects({testContext}),
    })),
    testContext: addUnconsumedEffects(testContext, effects.unconsumed)
  };
};

export const consumeActionsWithEffects = map(action => ({testContext}) => ({
  feed: action,
  consume: consumeDispatchActionEffects({testContext}),
}));

export const assertUnconsumedEffects = fn => ({testContext}) => ({
  feed: {type: 'a rosmaro-testing-library action to verify unconsumed effects'},
  consume: () => {
    const unconsumedEffects = view(unconsumedEffectsLens, testContext) || [];
    fn(unconsumedEffects);
    return {
      testContext: set(unconsumedEffectsLens, [], testContext),
    };
  }
})