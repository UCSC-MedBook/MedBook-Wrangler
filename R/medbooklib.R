library(rmongodb)
library(rjson)
library(methods)
library(httr)
library(stringr)
MedBookConnection <- function(user="", password="") {
       env = Sys.getenv()
       if ((str_length(user) >1  && str_length(password) >1) 
               || ("MEDBOOKUSER" %in% names(env) && "MEDBOOKPASSWORD" %in% names(env))) {
            if (str_length(user) < 2)     { 
                user <- paste0(env["MEDBOOKUSER"]) 
            }
            if (str_length(password) < 2) { 
                password <- paste0(env["MEDBOOKPASSWORD"]); 
            }
            if ("MEDBOOKSERVER" %in% names(env)) { 
                server <<- paste0(env["MEDBOOKSERVER"]); 
            }
            else { 
                server <<- "https://medbook.ucsc.edu"; 
            }
#            if (server[-1] == "/") {
#                server = server[0:-1]
#            }
            print(c('login:',user ))
            payload = list(user = user, password = password)
            full_url = paste0(server , "/data/api/login")
            print(c("server:",full_url))
            credentials = POST(full_url, body=payload, encode = "form")
#print(c("credentials:",credentials))
            stopifnot( credentials != NULL)
            stopifnot( credentials$status_code == 200)
                 # "Could not login: " + toString(credentials.status_code) + " " + credentials.reason + ", check MEDBOOKUSER && MEDBOOKPASSWORD for server:" + server)
            obj = content(credentials)
            cred <- obj$data
            credentials <<- cred
            print(paste('obj$data',cred$authToken))
            print(names(cred))
            stopifnot( obj != NULL ) 
            stopifnot( obj$data != NULL) 
            stopifnot( "authToken" %in% names(cred) ) 
            stopifnot( "userId" %in% names(cred) ) 
            #"Could not login: badly formed response from Meteor Restivius" + (credentials) + toString(obj);
#credentials = obj["data"];
        }
        else { 
            print( "Please pass username and password or set MEDBOOKUSER && MEDBOOKPASSWORD in your environment variables. You will also need to set MEDBOOKSERVER if you are not using medbook.ucsc.edu");
        }
        cred
}

find <- function (collName, query="", params=""){
        stopifnot( str_length(query)==0 || str_length(params)==0)
# "MedBook.find(): Use either a Mongo query or keywords, but not both"

        headers = list("X-Auth-Token"= credentials$authToken, "X-User-Id"= credentials$userId);
        j_headers = toJSON(headers)
        print(paste('headers',j_headers))

        if (str_length(query)>1) {
            params = list( 'json'=query );
        }
        else {
            for (key in params){
                if (typeof(params[key]) == "list") {
                    print(c("params:",params, params[key]))
#params[key] = ",".join(params[key])
                }
            }
        }

        url = paste0(server , "/data/api/", collName)
        wrapped = GET(url, add_headers(j_headers));
#wrapped = GET(url, params=params, config=j_headers);
        print(content(wrapped))
        stopifnot( wrapped);
        result1 = toJSON(wrapped["data"]);
        stopifnot( result1);
        return (result1);
}
insert <- function(collection, obj){
        url = paste0(server , "/data/api/", collection)
        headers = list("X-Auth-Token"= credentials["authToken"], "X-User-Id"= credentials["userId"]);
        response = POST(url, json=obj, config=toJSON(headers));
        if (response.status_code == 200) {
            return(toJSON(response['data']));
        }
        else {
            print( toString(response.status_code) + " " + toString(response.reason));
            return(-1)
        }

}
update <- function(collection, obj){
        if (! ("_id" %in% obj)  || obj["_id"] == NULL) {
            print ( c("update needs a valid _id  field:\n" , toString(obj) ));
            return(-2)
        }
        url = paste0(server , "/data/api/", collection)
        headers = list("X-Auth-Token"= credentials["authToken"], "X-User-Id"= credentials["userId"]);
        response = PUT(url, json=obj, config=toJSON(headers));
        if (response.status_code == 200) {
            return(response['data']);
        }
        else {
            print(  c(toString(response.status_code) , " " , toString(response.reason)));
            return(-3)
        }
}


test <- function(){
    medbook = MedBookConnection();
    print(paste('authToken:',medbook$authToken))

    tests = 0;
    result = tryCatch({
        medbook = MedBookConnection("foo", "bar");
        print(paste0("Should not get here return =", medbook))
    }, error = function(e) {
        tests <- tests + 1;
    })
    print("find clinical ")
    data = find("Clinical_Info");
    print(paste0("find clinical ", data))
    stopifnot( length(data) > 1)
    tests <- tests + 1;

    data = find("Expression2", toJSON(list( "Study_ID"= "prad_wcdt", "gene"= "BRCA1" )));
    stopifnot( length(data) == 1)
    tests <- tests + 1;

#data = find("Expression2", { "Study_ID": {"$in": [ "prad_tcga", "prad_wcdt"] },  "gene": { "$in": ["EGFR","BRCA1"]}});
#    stopifnot( length(data) == 2)
#    tests <- tests + 1;

    data = find("Expression2", list(gene="EGFR"));
    stopifnot( length(data) == 1)
    tests <- tests + 1;

    data = find("Expression2", list(gene=list("EGFR","BRCA1")));
    stopifnot( length(data) == 2)
    tests <- tests + 1;

    data = find("Expression2", list(gene=list("EGFR","BRCA1"), Study_ID= "prad_wcdt"));
    stopifnot( length(data) == 2)
    tests <- tests + 1;

    contrast = insert("contrast", list(
                name="ForBetterOrWorse", 
                studyID="prad_wcdt", 
                group1Name="Better", 
                group2Name="Worse", 
                list1=list("DTB-001", "DTB-002", "DTB-003"),
                list2=list("DTB-004", "DTB-005", "DTB-006"),
                collaborations="prad_wcdt"));

    stopifnot( length(contrast))
    tests <- tests + 1;

    sig  = insert("signature", list(
                name="BOW Sig", 
                studyID="prad_wcdt",
                version=1, 
                contrast=contrast["_id"], 
                signature=list( "AR" : list( "weight" : 3.3 ),  "ASCL1" : list( "weight" : "0.042114584368837" ))));
    stopifnot( length(sig))
    tests <- tests + 1;

    sig["signature"] = list( "AR" : list( "weight" : 1.0 ), "ASCL1" : list( "weight" : "1.0" ));
    sig  = medbook("signature", sig);

    
    stopifnot( length(sig))
    tests <- tests + 1;

    print(c("success tests", tests, "passed"))
    return(0);
}
test()
