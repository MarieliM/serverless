import { APIGatewayProxyHandler } from "aws-lambda"
import { v4 as uuid } from 'uuid'
// import * as dayjs from 'dayjs'

import { document } from "../utils/dynamodbClient"

interface ICreateTodo {
  title: string,
  deadline: string
}

export const handler: APIGatewayProxyHandler = async (event) =>{
  const { user_id } = event.pathParameters
  const { title, deadline } = JSON.parse(event.body) as ICreateTodo

  const id = uuid()
  const date = new Date(deadline)

  await document.put({
    TableName: 'todos',
    Item: {
      id: id,
      user_id,
      title,
      done: false,
      deadline: date.toDateString(),
    }
  }).promise()

  const response = await document.query({
    TableName: 'todos',
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": id
    }
  }).promise()

  return{
    statusCode: 201,
    body: JSON.stringify(response.Items[0])
  }
}