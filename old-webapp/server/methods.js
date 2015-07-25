
Meteor.startup(function() {
    Restivus.configure({
        prettyJson: false,
        useAuth: true,
    });

    CRFmetadataCollection.find().forEach(function(collMeta) {
        var name = collMeta.name;
        var collection = new Meteor.Collection(name);
        Collections[name] = collection;

        REST(name, collMeta, collection, false);
    });
    REST("expression2", null, Expression2);
    REST("expression_isoform", null, Expression_Isoform, false);
    REST("signature", null, Signature, true);
    REST("contrast", null, Contrast, true);
});

function REST(collName, collMeta, coll, modify) {

    get = function () {
      var query = {};
      if (this.user) {
          if (this.queryParams) {
            query = this.queryParams;
            if ("json" in query)
                query = JSON.parse(query.json);
            else
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
          if (docs.length > 0) {
            return {status: 'success', data: docs};
          }
      }

      return {
        statusCode: 404,
        body: {status: 'fail', message: collName + ' not found!'}
      };

    };
    post =  {
      action: function () {
          var _id = coll.insert(this.bodyParams);
          if (_id) {
            var obj = coll.findOne(_id);
            return {status: "success", data: obj};
          }
          else {
            return {
              statusCode: 404,
              body: {status: "fail", message: collName + "  not found"}
            }
          }
      }
    };
    put =  {
      action: function () {
          var entityIsUpdated = coll.upsert(this.bodyParams._id, this.bodyParams);
          if (entityIsUpdated && entityIsUpdated.numberAffected > 0 ) {
            var entity = coll.findOne(this.bodyParams._id);
            return {status: "success", data: entity};
          }
          else {
            return {
              statusCode: 404,
              body: {status: "fail", message: collName + " not found"}
            }
          }
      }
    };
    deleteF =  {
      action: function () {
        if (Posts.remove(this.urlParams.id)) {
          return {status: "success", data: {message: "Item removed"}};
        }
        return {
          statusCode: 404,
          body: {status: "fail", message: "Item not found"}
        };
      }
    };
   Restivus.addRoute(collName, {authRequired: true}, { get: get, post: post, put: put, delete: deleteF });

}


/*
Restivus.addCollection(Signature, {
    excludedEndpoints: ['deleteAll', 'put'],
    routeOptions: {
      authRequired: true
    },
    endpoints: {
      post: {
        authRequired: false
      },
      delete: {
        roleRequired: 'admin'
      }
    }
});

Restivus.addCollection(Contrast, {
    excludedEndpoints: ['deleteAll', 'put'],
    routeOptions: {
      authRequired: true
    },
    endpoints: {
      post: {
        authRequired: false
      },
      delete: {
        roleRequired: 'admin'
      }
    }
});


*/
