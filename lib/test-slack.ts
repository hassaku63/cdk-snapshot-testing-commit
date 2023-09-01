import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as aws_lambda from "aws-cdk-lib/aws-lambda";
import * as aws_codebuild from "aws-cdk-lib/aws-codebuild";

interface TestSlackProps extends cdk.StackProps {
  slackChannelId: string;
}

export class TestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: TestSlackProps) {
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
        // bin/ 配下のエントリポイントモジュールでは環境変数から取り込むような処理を記述している想定
        // ただし、Construct クラスの実装としては環境変数かどうかの知識は持たず、単なるパラメータの1つとして扱う
        // snapshot の作成時にこのクラスのインスタンスを作成する必要があるので、その際にダミー値を渡す。
        "SLACK_CHANNEL": props.slackChannelId,
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
        // bin/ 配下のエントリポイントモジュールでは環境変数から取り込むような処理を記述している想定
        // ただし、Construct クラスの実装としては環境変数かどうかの知識は持たず、単なるパラメータの1つとして扱う
        // snapshot の作成時にこのクラスのインスタンスを作成する必要があるので、その際にダミー値を渡す。
        "SLACK_CHANNEL": {
          type: aws_codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: props.slackChannelId,
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
