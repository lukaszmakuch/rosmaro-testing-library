const dontVerify = () => {};

export default ({model, flow}) => {
  let state;
  flow.forEach(({action, verifyResult = dontVerify}) => {
    const {state: newState, result} = model({state, action});
    verifyResult({result});
    state = newState;
  });
};