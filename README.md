# Wrangler [![Build Status](https://travis-ci.org/UCSC-MedBook/MedBook-Wrangler.svg)](https://travis-ci.org/UCSC-MedBook/MedBook-Wrangler)

## Testing

Running the tests will create the following user.

```javascript
Accounts.createUser({
  email: 'testing@meteor.com',
  password: 'testing',
  profile: {
    collaborations: ['testing']
  }
});
```
