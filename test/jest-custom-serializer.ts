import { NewPlugin } from 'pretty-format';

type CodeBuildProject = {
  Type: 'AWS::CodeBuild::Project';
  Properties: {
    Environment: {
      EnvironmentVariables?: {
        Name: string;
        Type?: 'PARAMETER_STORE' | 'PLAINTEXT' | 'SECRETS_MANAGER';
        Value: string;
      }[],
      [key: string]: any;
    },
    [key: string]: any;
  };
  [key: string]: any;
}

type LambdaFunction = {
  Type: 'AWS::Lambda::Function';
  Properties: {
    Environment?: {
      Variables?: {
        [key: string]: string;
      }
    },
    [key: string]: any;
  };
  [key: string]: any;
}

type ExpectedCfnResource = CodeBuildProject | LambdaFunction;
type Serialize = NewPlugin['serialize'];

const isValidResourceType = (val: any): val is ExpectedCfnResource => {
  return val.Type && (val.Type === 'AWS::CodeBuild::Project' || val.Type === 'AWS::Lambda::Function')
    && val.Properties
    // && (
    //   val.Properties.Environment // Lambda Function
    //   && val.Properties.Environment.EnvironmentVariables // CodeBuild Project
    // )
};

const serialize: Serialize = (val, config, indentation, depth, refs, printer) => {
  const toJson = (val: any) => JSON.stringify(val, null, 2);

  if (!isValidResourceType(val)) {
    return toJson(val);
  }

  // CloudFormation のリソースタイプに応じて環境変数の値に対応するプロパティをマスクする
  let result: any;
  switch (val.Type) {
    case 'AWS::CodeBuild::Project':
      result = JSON.parse(JSON.stringify(val));
      let envVars = val.Properties.Environment.EnvironmentVariables;
      if (envVars !== undefined) {
        for (let i = 0; i < envVars.length; i++) {
          envVars[i].Value = '***';
        }
        result.Properties.Environment.EnvironmentVariables = envVars;
      }
      break;

    case 'AWS::Lambda::Function':
      result = JSON.parse(JSON.stringify(val));
      let envs = val.Properties.Environment?.Variables;
      if (envs !== undefined) {
        for (let key of Object.keys(envs)) {
          envs[key] = '***';
        }
        result.Properties.Environment.Variables = envs;
      }
      break;

    default:
      throw new Error(`Unexpected resource: ${val}`);
  }
  return toJson(result);
}

export default {
  test: isValidResourceType,
  serialize,
};
