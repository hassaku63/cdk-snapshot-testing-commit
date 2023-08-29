import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as aws_lambda from "aws-cdk-lib/aws-lambda";
import * as aws_codebuild from "aws-cdk-lib/aws-codebuild";

export class TestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const func = new aws_lambda.Function(this, "TestFunction", {
      runtime: aws_lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: aws_lambda.Code.fromInline(`
        exports.handler = async function (event, context) {
          console.log("EVENT: \n" + JSON.stringify(event, null, 2));
          return context.logStreamName;
        };
      `),
      environment: {
        "SLACK_CHANNEL": "test-channel",
      },
    });

    const project = new aws_codebuild.Project(this, "TestProject", {
      buildSpec: aws_codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          build: {
            commands: [
              "echo hello world",
            ],
          },
        },
      }),
      environmentVariables: {
        "SLACK_CHANNEL": {
          type: aws_codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: "test-channel",
        },
      },
    });

    new cdk.CfnOutput(this, "TestFunctionArn", { value: func.functionArn });
    new cdk.CfnOutput(this, "TestProjectArn", { value: project.projectArn });
  }
}
