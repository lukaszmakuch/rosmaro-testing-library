import {is, pipe, map, flatten, join, filter, complement, isNil} from 'ramda';

const blah = tree => {
  const labelled = is(String, tree[0]);
  const label = labelled ? tree[0] : null;
  const rootNode = labelled ? tree[1] : tree[0];
  const children = (labelled ? tree[2] : tree[1]) || [];

  if (children.length) {
    return pipe(
      map(blah),
      flatten,
      map(subtree => ({
        labels: [label, ...subtree.labels],
        steps: [rootNode, ...subtree.steps]
      }))
    )(children);
  } else {
    return [
      {
        labels: [label],
        steps: [rootNode]
      }
    ];
  }
}

export default (formatLabel = join(' > ')) => flowTestRunner => tree => {
  const flatCases = blah(tree);
  flatCases.forEach(({labels, steps}) => {
    const testLabel = pipe(
      filter(complement(isNil)),
      formatLabel
    )(labels)
    flowTestRunner(testLabel, steps);
  })
};
