const assert = require('chai').assert;
const db = require('./db');
const request = require('./request');

describe('/me API', () => {

  before(db.drop);

  let token = '';

  const user = {
    email: 'sup@suuuup.com',
    password: 'yippeeeee'
  };

  let testIngredients = [
    { name: 'tea' }, { name: 'ice cream' }, { name: 'shishkabob' }
  ];

  before(() => {
    return request.post('/auth/signup')
      .send(user)
      .then(res => token = res.body.token);
  });

  it('initial GET returns test user', () => {
    return request.get('/me')
      .set('Authorization', token)
      .then(res => assert.equal(res.body.email, user.email));
  });

  describe('fridge post', () => {

    before(() => {
      return request.post('/ingredients')
        .set('Authorization', token)
        .send(testIngredients)
        .then(res => res.body)
        .then(savedIngredients => {
          assert.ok(savedIngredients[0]._id);
          testIngredients = savedIngredients;
        });
    });

    it('adding single ingredient to fridge', () => {
      let fridgeItem = { ingredient: testIngredients[0]._id };

      return request.post('/me/fridge')
        .set('Authorization', token)
        .send(fridgeItem)
        .then(res => res.body)
        .then(fridgeArray => {
          assert.equal(fridgeArray[0].ingredient, testIngredients[0]._id);
        });
    });

    it('adding multiple ingredients to fridge', () => {
      let fridgeItem = [{ ingredient: testIngredients[0]._id, expiration: new Date() }, { ingredient: testIngredients[1]._id, expiration: new Date() }];

      return request.post('/me/fridge')
        .set('Authorization', token)
        .send(fridgeItem)
        .then(res => res.body)
        .then(fridgeArray => {
          assert.equal(fridgeArray[0].ingredient, testIngredients[0]._id);
          assert.equal(fridgeArray.length, 3);
        });
    });

    it('gets ingredients in fridge', () => {
      return request.get('/me/fridge')
        .set('Authorization', token)
        .then(res => res.body)
        .then(fridgeIngredients => {
          assert.equal(fridgeIngredients.length, 3);
        });

    });
  });
});