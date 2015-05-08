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
                self.server = "https://medbook.ucsc.edu";

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
            self.url = self.server;
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

        wrapped = requests.get(self.server + "/data/api/" + collName, params=params, headers=headers);
        assert wrapped, "could not connect, connection timed out"
        result = wrapped.json()["data"];
        assert wrapped, "bad query"
        return result;


def test():
    tests = 0;
    try:
        medbook = MedBookConnection("foo", "bar");
        assert false, "Should not get here"
    except:
        tests += 1;
        pass
    

    medbook = MedBookConnection();
    data = medbook.find("Expression2", { "Study_ID": "prad_wcdt", "gene": "BRCA1" });
    assert len(data) == 1
    tests += 1;

    data = medbook.find("Expression2", { "Study_ID": {"$in": [ "prad_tcga", "prad_wcdt"] },  "gene": { "$in": ["EGFR","BRCA1"]}});
    assert len(data) == 4
    tests += 1;

    data = medbook.find("Expression2", gene="EGFR");
    assert len(data) == 2
    tests += 1;

    data = medbook.find("Expression2", gene=["EGFR","BRCA1"]);
    assert len(data) == 4
    tests += 1;

    data = medbook.find("Expression2", gene=["EGFR","BRCA1"], Study_ID= "prad_wcdt");
    assert len(data) == 2
    tests += 1;

    print "success tests", tests, "passed"

if __name__ == "__main__":
    test()
