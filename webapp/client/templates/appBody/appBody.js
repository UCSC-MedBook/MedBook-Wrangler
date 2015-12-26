Template.appBody.helpers({
  getRouteName: function () {
    if (Router.current().route) {
      return Router.current().route.getName();
    }
  },
});
