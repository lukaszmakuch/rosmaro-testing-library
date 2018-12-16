import {flatten, is, head, tail, isEmpty} from 'ramda';

const dontVerify = () => {};

const performTest = ({step, context, model, state}) => {
  if (is(Array)(step)) {
    if (isEmpty(step)) {
      return {state, context};
    } else {
      const headCallResult = performTest({
        step: head(step),
        context,
        model,
        state
      });
      return performTest({
        step: tail(step),
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
      action: step.action(context)
    });
    if (step.verify) {
      const maybeNewContext = step.verify({
        result: modelCallResult.result,
        context
      }); 
      return {
        state: modelCallResult.state,
        context: maybeNewContext || context
      };
    } else {
      return {
        state: modelCallResult.state,
        context
      };
    }
  }
}

export const testFlow = ({model, flow, initialContext = {}}) => {
  performTest({model, state: undefined, context: initialContext, step: flow});
};