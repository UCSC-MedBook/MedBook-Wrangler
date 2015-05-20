import os,sys
import requests
import pdb
import json

class MedBookConnection:

    def __init__(self, user=None, password=None):
        if (user != None and password != None) or ("MEDBOOKUSER" in os.environ and "MEDBOOKPASSWORD" in os.environ):
            if user == None:
                user = os.environ["MEDBOOKUSER"];
            if password == None:
                password = os.environ["MEDBOOKPASSWORD"];

            if "MEDBOOKSERVER" in os.environ:
                self.server = os.environ["MEDBOOKSERVER"];
            else:
                self.server = "http://localhost";

            if self.server[-1] == "/":
                self.server = self.server[0:-1]

            payload = dict(user=user, password=password);
            self.credentials = requests.post(self.server + "/data/api/login", data=payload)
            assert self.credentials != None, "could not connect to server";
            assert self.credentials.status_code == 200, "Could not login: " + str(self.credentials.status_code) + " " + self.credentials.reason + ", check MEDBOOKUSER and MEDBOOKPASSWORD for server:" + self.server;
            obj = self.credentials.json();
            assert obj != None and "data" in obj and obj["data"] != None, "Could not login: badly formed response from Meteor Restivius" + (self.credentials) + str(obj);
            self.credentials = obj["data"];
            assert self.credentials["authToken"], "Not logged in, check password";
            assert self.credentials["userId"], "Not Logged in";
            return;
        raise Exception("Please pass username and password or set MEDBOOKUSER and MEDBOOKPASSWORD in your environment variables. You will also need to set MEDBOOKSERVER if you are not using medbook.ucsc.edu");



    def find(self, collName, query=None, **params):
        assert query==None or len(params)==0, "MedBook.find(): Use either a Mongo query or keywords, but not both"

        headers = {"X-Auth-Token": self.credentials["authToken"], "X-User-Id": self.credentials["userId"]};

        if query:
            params = { "json": json.dumps(query) };
        else:
            for key in params:
                if isinstance(params[key], list):
                    params[key] = ",".join(params[key])

        url = self.server + "/data/api/" + collName;
        wrapped = requests.get(url, params=params, headers=headers);
        assert wrapped, "could not connect, connection timed out"
        result = wrapped.json()["data"];
        assert wrapped, "bad query"
        return result;

    def insert(self, collection, obj):
        url = self.server + "/data/api/" + collection
        headers = {"X-Auth-Token": self.credentials["authToken"], "X-User-Id": self.credentials["userId"]};
        response = requests.post(url, data=obj, headers=headers);
        if response.status_code == 200:
            return response.json()['data'];
        else:
            raise Exception( str(response.status_code) + " " + str(response.reason));

    def update(self, collection, obj):
        if not ("_id" in obj)  or obj["_id"] == None:
            raise Exception( "update needs a valid _id  field:\n" + str(obj) );
        url = self.server + "/data/api/" + collection  #   + "/" + obj["_id"] + "/";
        headers = {"X-Auth-Token": self.credentials["authToken"], "X-User-Id": self.credentials["userId"]};
        response = requests.put(url, data=obj, headers=headers);
        if response.status_code == 200:
            return response.json()['data'];
        else:
            raise Exception( str(response.status_code) + " " + str(response.reason));


def test():
    medbook = MedBookConnection();

    tests = 0;
    try:
        medbook = MedBookConnection("foo", "bar");
        assert false, "Should not get here"
    except:
        tests += 1;
        pass
    
    data = medbook.find("Clinical_Info");
    assert len(data) > 1
    tests += 1;

    data = medbook.find("Expression2", { "Study_ID": "prad_wcdt", "gene": "BRCA1" });
    assert len(data) == 1
    tests += 1;

    data = medbook.find("Expression2", { "Study_ID": {"$in": [ "prad_tcga", "prad_wcdt"] },  "gene": { "$in": ["EGFR","BRCA1"]}});
    assert len(data) == 2
    tests += 1;

    data = medbook.find("Expression2", gene="EGFR");
    assert len(data) == 1
    tests += 1;

    data = medbook.find("Expression2", gene=["EGFR","BRCA1"]);
    assert len(data) == 2
    tests += 1;

    data = medbook.find("Expression2", gene=["EGFR","BRCA1"], Study_ID= "prad_wcdt");
    assert len(data) == 2
    tests += 1;

    contrast = medbook.insert("contrast", dict(
                name="ForBetterOrWorse", 
                studyID="prad_wcdt", 
                group1Name="Better", 
                group2Name="Worse", 
                list1=["DTB-001", "DTB-002", "DTB-003"],
                list2=["DTB-004", "DTB-005", "DTB-006"],
                collaborations="prad_wcdt"));

    assert len(contrast)
    tests += 1;

    sig  = medbook.insert("signature", dict(
                name="BOW Sig", 
                studyID="prad_wcdt",
                version=1, 
                contrast=contrast["_id"], 
                signature={ "AR" : { "weight" : 3.3 },  "ASCL1" : { "weight" : "0.042114584368837" }}));
    assert len(sig)
    tests += 1;

    sig["signature"] = { "AR" : { "weight" : 1.0 }, "ASCL1" : { "weight" : "1.0" }};
    sig  = medbook.update("signature", sig);

    
    assert len(sig)
    tests += 1;

    print "success tests", tests, "passed"
    sys.exit(0);


if __name__ == "__main__":
    test()
