import {pipe, flatten, filter, propEq, map} from 'ramda';

const consumeDispatchActionEffects = ({result: {effect = []}}) => {
  const dispatchActionEffects = pipe(
    flatten,
    filter(propEq('type', 'DISPATCH'))
  )([effect]);

  return {
    step: dispatchActionEffects.map(({action}) => ({
      feed: action,
      consume: consumeDispatchActionEffects,
    }))
  };
};

const consumeActionsWithEffects = map(action => ({
  feed: action,
  consume: consumeDispatchActionEffects,
}));

export default consumeActionsWithEffects;