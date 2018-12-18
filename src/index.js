import {flatten, is, head, tail, isEmpty} from 'ramda';

const getNext = ({next, result}) =>
  next
    ? is(Function)(next)
      ? next({result}) || {}
      : next || {}
    : {};

const performTest = ({step, context, model, state}) => {
  if (is(Array)(step)) {
    if (isEmpty(step)) {
      return {state, context, step: []};
    } else {
      const headCallResult = performTest({
        step: head(step),
        context,
        model,
        state
      });
      return performTest({
        step: [...headCallResult.step, ...tail(step)],
        context: headCallResult.context,
        state: headCallResult.state,
        model
      });
    }
  } else if (is(Function)(step)) {
    return performTest({
      step: step({context}),
      context,
      model,
      state
    });
  } else {
    const modelCallResult = model({
      state,
      action: step.action,
    });

    if (step.verify) {
      step.verify({
        result: modelCallResult.result,
        context
      })
    }

    const result = modelCallResult.result;
    const next = getNext({
      result,
      next: step.next
    });
    const nextContext = next.context || context;
    const nextStep = [next.step || []];
    return {
      state: modelCallResult.state,
      context: nextContext,
      step: nextStep,
    };
  }
}

export const testFlow = ({model, flow, initialContext = {}}) => {
  performTest({model, state: undefined, context: initialContext, step: flow});
};