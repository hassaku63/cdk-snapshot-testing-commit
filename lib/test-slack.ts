import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as aws_lambda from "aws-cdk-lib/aws-lambda";
import * as aws_codebuild from "aws-cdk-lib/aws-codebuild";

export class TestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * AWS::Lambda::Function
     */
    // 環境変数ありのパターン
    new aws_lambda.Function(this, "TestFunctionWithEnv", {
      runtime: aws_lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: aws_lambda.Code.fromInline(`
        exports.handler = async function (event, context) {
          console.log("EVENT: \n" + JSON.stringify(event, null, 2));
          return context.logStreamName;
        };
      `),
      environment: {
        // Note:
        // ここでは簡単のため直接チャンネル名に相当する文字列を記述しているが、
        // 実際には process.env から値を注入し、値がコミットされないように書く想定の箇所
        "SLACK_CHANNEL": "test-channel",
      },
    });

    // 環境変数を持たないパターン
    new aws_lambda.Function(this, "TestFunctionWithoutEnv", {
      runtime: aws_lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: aws_lambda.Code.fromInline(`
        exports.handler = async function (event, context) {
          console.log("EVENT: \n" + JSON.stringify(event, null, 2));
          return context.logStreamName;
        };
      `),
      // environment: {
      // },
    });

    /**
     * AWS::CodeBuild::Project
     */
    // 環境変数ありのパターン
    new aws_codebuild.Project(this, "TestProjectWithEnv", {
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
        // Note:
        // ここでは簡単のため直接チャンネル名に相当する文字列を記述しているが、
        // 実際には process.env から値を注入し、値がコミットされないように書く想定の箇所
        "SLACK_CHANNEL": {
          type: aws_codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: "test-channel",
        },
      },
    });

    // 環境変数を持たないパターン;
    new aws_codebuild.Project(this, "TestProjectWithoutEnv", {
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
      // environmentVariables: {
      // },
    });
  }
}
