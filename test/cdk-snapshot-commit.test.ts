import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { TestStack } from '../lib/test-slack';

describe('Snapshot testing', () => {
  test('Test Stack', () => {
    const app = new cdk.App();
    const stack = new TestStack(app, 'MyTestStack', {
      // dummy value
      slackChannelId: '***',
    });

    const t = Template.fromStack(stack);
    expect(t).toMatchSnapshot();
  });
});
