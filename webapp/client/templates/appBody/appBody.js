Template.appBody.helpers({
  getRouteName: function () {
    if (Router.current().route) {
      return Router.current().route.getName();
    }
  },
  viewOrEdit: function () {
    var data = Router.current().data();

    if (!data){
      return "Loading";
    } else if (data.status === "editing") {
      return "Edit";
    } else {
      return "View";
    }
  },
});
