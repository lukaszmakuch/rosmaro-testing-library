import {
  flatten,
  is,
  head,
  tail,
  isEmpty,
  isNil,
  complement,
  filter
} from 'ramda';

const addRecentEffects = (testContext, recentEffects) => ({
  ...testContext,
  recentEffects: filter(complement(isNil), flatten([
    testContext.recentEffects || [],
    recentEffects
  ]))
});

const performTest = ({step, testContext, model, state}) => {
  if (is(Array)(step)) {
    if (isEmpty(step)) {
      return {state, testContext, step: []};
    } else {
      const headCallResult = performTest({
        step: head(step),
        testContext,
        model,
        state
      });
      return performTest({
        step: [...headCallResult.step, ...tail(step)],
        testContext: headCallResult.testContext,
        state: headCallResult.state,
        model
      });
    }
  } else if (is(Function)(step)) {
    return performTest({
      step: step({testContext}),
      testContext,
      model,
      state
    });
  } else {
    const modelCallResult = model({
      state,
      action: step.feed,
    });

    const result = modelCallResult.result || {};
    const testContextWithEffects = addRecentEffects(testContext, result.effect);
    const next = step.consume
      ? step.consume({
        result,
        testContext: testContextWithEffects
      }) || {}
      : {};

    const nextTestContext = next.testContext || testContextWithEffects;
    const nextStep = [next.step || []];
    return {
      state: modelCallResult.state,
      testContext: nextTestContext,
      step: nextStep,
    };
  }
}

const testFlow = ({model, flow, initialTestContext = {}}) => {
  performTest({model, state: undefined, testContext: initialTestContext, step: flow});
};

export default testFlow;