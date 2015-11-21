# MedBook-Wrangler

## Testing

Testing for Wrangler requires the users created in the code block below.

```javascript
Accounts.createUser({
  email: 'testing@meteor.com',
  password: 'testing',
  profile: {
    collaborations: ['testing']
  }
});
```
