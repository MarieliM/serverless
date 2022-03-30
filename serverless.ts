import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'todo',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', "serverless-dynamodb-local", 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  // import the function via paths
  functions: { 
    create: {
      handler: "src/functions/create.handler",
      events: [
        {
          http: {
            path: "todos/{user_id}",
            method: "post",
            cors: true
          }
        }
      ]
    },
    get: {
      handler: "src/functions/get.handler",
      events: [
        {
          http: {
            path: "todos/{user_id}",
            method: "get",
            cors: true
          }
        }
      ]
    }
   },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    dynamodb:{
      stages: ["dev", "local"],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true
      }
    },
  },
  resources: {
    Resources: {
      dbTodo: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "todos",
          ProvisionedThroughput:{
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          },
          AttributeDefinitions:[{
            AttributeName: "id",
            AttributeType: "S"
          }],
          KeySchema: [{
            AttributeName: "id",
            KeyType: "HASH"
          }]
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;