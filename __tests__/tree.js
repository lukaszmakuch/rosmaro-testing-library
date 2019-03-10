import {makeTreeRunner} from './../src';

test('tree test runner', () => {
  const flowTestRunner = jest.fn();

  const rootStep = jest.fn();
  const branch1A = jest.fn();
  const branch1B = jest.fn();
  const finishBranch1 = jest.fn();
  const extraFor1A = jest.fn();
  const failBranch1 = jest.fn();

  const treeOfCases =
    ['root', rootStep, [
      [branch1A, [
        ['finished branch 1A', finishBranch1, [
          ['get something extra', extraFor1A]
        ]]
      ]],
      [branch1B, [
        ['finished branch 1B', finishBranch1],
        ['Oops! Branch 1B failed!', failBranch1]
      ]]
    ]];

  makeTreeRunner()(flowTestRunner)(treeOfCases);

  expect(flowTestRunner.mock.calls).toEqual([

    ['root > finished branch 1A > get something extra', [
      rootStep,
      branch1A,
      finishBranch1,
      extraFor1A,
    ]],

    ['root > finished branch 1B', [
      rootStep,
      branch1B,
      finishBranch1,
    ]],

    ['root > Oops! Branch 1B failed!', [
      rootStep,
      branch1B,
      failBranch1,
    ]],

  ]);
});