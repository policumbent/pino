import request from 'supertest';
import app from '../src/app';

describe('Test `/test` path', () => {
  test('It should response the GET method', () => {
    return request(app)
      .get('/test')
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });
});
