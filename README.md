# MedBook-Wrangler

## Testing

Testing for Wrangler requires the following code to be run.

```javascript
Accounts.createUser({
  email: 'testing@meteor.com',
  password: 'testing',
  profile: {
    collaborations: ['testing']
  }
});

Collaborations.upsert({
  name: 'testing',
  description: 'A testing collaboration. All data here is fake',
  isUnlisted: true,
  collaborators: [],
  administrators: [
    'testing@meteor.com'
  ],
});
```
