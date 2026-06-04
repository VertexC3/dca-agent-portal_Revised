/**
 * Generic data CRUD over DynamoDB — backs the frontend DataService (M1 of the
 * Base44 → AWS migration). One table, keyed by (collection, id).
 *
 * Routes (HTTP API):
 *   GET    /data/{collection}            -> list (optional ?filterKey=&filterVal=)
 *   POST   /data/{collection}            -> create (body is the item; id optional)
 *   GET    /data/{collection}/{id}       -> get one
 *   PUT    /data/{collection}/{id}       -> upsert
 *   DELETE /data/{collection}/{id}       -> delete
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient, QueryCommand, GetCommand, PutCommand, DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME;

export const handler = async (event) => {
  try {
    const method = event.requestContext?.http?.method || 'GET';
    const { collection, id } = event.pathParameters || {};
    if (!collection) return json(400, { error: 'collection required' });

    const body = event.body ? JSON.parse(event.body) : undefined;
    const qs = event.queryStringParameters || {};

    if (method === 'GET' && id) {
      const { Item } = await doc.send(new GetCommand({ TableName: TABLE, Key: { collection, id } }));
      return Item ? json(200, strip(Item)) : json(404, { error: 'not found' });
    }

    if (method === 'GET') {
      const out = await doc.send(new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'collection = :c',
        ExpressionAttributeValues: { ':c': collection },
      }));
      let items = (out.Items || []).map(strip);
      if (qs.filterKey && qs.filterVal !== undefined) {
        items = items.filter((it) => String(it[qs.filterKey]) === String(qs.filterVal));
      }
      return json(200, items);
    }

    if (method === 'POST' || method === 'PUT') {
      if (!body || typeof body !== 'object') return json(400, { error: 'body required' });
      const itemId = id || body.id || cryptoId();
      const Item = { ...body, collection, id: itemId };
      await doc.send(new PutCommand({ TableName: TABLE, Item }));
      return json(method === 'POST' ? 201 : 200, strip(Item));
    }

    if (method === 'DELETE' && id) {
      await doc.send(new DeleteCommand({ TableName: TABLE, Key: { collection, id } }));
      return json(204, {});
    }

    return json(405, { error: `unsupported ${method}` });
  } catch (err) {
    return json(500, { error: err.message });
  }
};

// Hide the internal partition key from API consumers.
const strip = ({ collection, ...rest }) => rest;

const cryptoId = () => `${Date.now().toString(36)}-${Math.round(Math.random() * 1e9).toString(36)}`;

const json = (statusCode, payload) => ({
  statusCode,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(payload),
});
