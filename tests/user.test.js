const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../model/User');

jest.mock('../helpers/cloudinary', () => ({
  uploadToCloudinary: jest.fn().mockResolvedValue('https://res.cloudinary.com/demo/image/upload/sample.jpg')
}));

beforeAll(async () => {
  // Ensure database connection is ready and clear the test database collection
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => {
      mongoose.connection.once('open', resolve);
    });
  }
  await User.deleteMany({});
});

afterAll(async () => {
  // Close the database connection to prevent pending handles in Jest
  await mongoose.connection.close();
});

describe('User Integration Tests (Register and Login)', () => {
  const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    phone: '11999999999',
    password: 'password123',
    confirmpassword: 'password123'
  };

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/user/register')
      .send(testUser);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('userId');
    expect(res.body.message).toContain('You are authenticated');
  });

  it('should fail user registration with duplicate email', async () => {
    const res = await request(app)
      .post('/user/register')
      .send(testUser);

    expect(res.statusCode).toEqual(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('A user with this email address already exists');
  });

  it('should log in successfully', async () => {
    const res = await request(app)
      .post('/user/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.userId).toBeDefined();
  });

  it('should fail log in with incorrect password', async () => {
    const res = await request(app)
      .post('/user/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid credentials!');
  });

  it('should edit a user profile with an image upload using multipart/form-data', async () => {
    const loginRes = await request(app)
      .post('/user/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    const token = loginRes.body.token;
    const userId = loginRes.body.user.userId;

    const buffer = Buffer.from('fake image data');

    const res = await request(app)
      .patch(`/user/edit/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Edited User')
      .field('email', testUser.email)
      .field('phone', '11888888888')
      .attach('image', buffer, 'test-image.png');

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toContain('Update successful!');
  });
});
