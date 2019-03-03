export default fn => ({testContext}) => ({
  feed: {type: 'a rosmaro-testing-library action to consume effects'},
  consume: () => {
    const effects = testContext.recentEffects || [];
    fn(effects);
    return {
      testContext: {
        ...testContext,
        recentEffects: []
      }
    };
  }
});