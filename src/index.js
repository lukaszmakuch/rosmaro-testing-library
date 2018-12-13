const dontVerify = () => {};

export const testFlow = ({model, flow}) => {

  // Default values:
  let state = undefined;
  let context = {};

  // Every step consits of an action factory and an optional result verification
  // function.
  flow.forEach(({action: makeAction, verify = dontVerify}) => {

    // The new state comes from calling the model.
    const action = makeAction(context);
    const {state: newState, result} = model({state, action});
    state = newState;

    // The result verification function may return a new context.
    const maybeNewContext = verify({result, context});
    if (maybeNewContext !== undefined) {
      context = maybeNewContext;
    }
    
  });
};