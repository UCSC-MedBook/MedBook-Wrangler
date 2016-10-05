Template.appBody.onRendered(function () {
  // color the background of the site if not on production
  if (Meteor.settings &&
      Meteor.settings.public.WORLD_URL === "staging.medbook.io") {
    // light green
    $("body").css("background-color", "#F6FFF2");
  } else if (!Meteor.settings ||
      Meteor.settings.public.WORLD_URL !== "medbook.io") {
    // light blue
    $("body").css("background-color", "#F2FCFF");
  }
});

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
