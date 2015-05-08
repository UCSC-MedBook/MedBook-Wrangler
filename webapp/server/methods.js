
Meteor.startup(function() {
    Restivus.configure({
        prettyJson: true,
        useAuth: true,
    });

    CRFmetadataCollection.find().forEach(function(collMeta) {
        var name = collMeta.name;
        var collection = new Meteor.Collection(name);
        Collections[name] = collection;

        console.log("REST", name);
        REST(name, collMeta, collection);
    });
    REST("expression2", null, Expression2);
    REST("expression_isoform", null, Expression_Isoform);

});

function REST(collName, collMeta, coll) {

  Restivus.addRoute(collName, {authRequired: true}, {
    get: function () {
      var query = {};
      if (this.user) {
          if (this.queryParams) {
            query = this.queryParams;
            Object.keys(query).map(function(key) {
                var a = query[key].split(",");
                if (a.length > 1)
                    query[key] =  { "$in": a };
            });

          }
          if (collMeta && 'collaborations' in collMeta.fieldOrder) {
             var my = this.user.profile.collaborations;
             query['collaborations'] = { $in: my};
          }

          var docs = coll.find(query).fetch();
          console.log("find", collName, query, docs.length);
          if (docs.length > 0) {
            return {status: 'success', data: docs};
          }
      }

      return {
        statusCode: 404,
        body: {status: 'fail', message: collName + ' not found'}
      };

    },
  });

}
