import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { TestStack } from '../lib/test-slack';
import { default as Serializer } from './jest-custom-serializer';

expect.addSnapshotSerializer(Serializer);

describe('Snapshot testing', () => {
  test('Test Stack', () => {
    const app = new cdk.App();
    const stack = new TestStack(app, 'MyTestStack');

    const t = Template.fromStack(stack);
    expect(t).toMatchSnapshot();
  });
});
