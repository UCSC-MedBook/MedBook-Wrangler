import os,sys
import requests
import pdb

class MedBookConnection:

    def __init__(self, user=None, password=None):
        if (user != None and password != None) or ("MEDBOOKUSER" in os.environ and "MEDBOOKPASSWORD" in os.environ):
            try:
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
                self.credentials = self.credentials.json()["data"];
                self.url = self.server
                return;
            finally:
                pass
        raise Exception("Please pass username and password or set MEDBOOKUSER and MEDBOOKPASSWORD in your environment variables");


    def find(self, collName, **params):
        try:
            headers = {"X-Auth-Token": self.credentials["authToken"], "X-User-Id": self.credentials["userId"]};
            for key in params:
                if isinstance(params[key], list):
                    params[key] = ",".join(params[key])
            res = requests.get(self.server + "/data/api/" + collName, params=params, headers=headers).json()["data"];
            return res;
        except:
            return None




def test():
    medbook = MedBookConnection();
    data = medbook.find("Expression2", gene="EGFR");
    assert len(data) == 2
    data = medbook.find("Expression2", gene=["EGFR","BRCA1"]);
    assert len(data) == 4
    data = medbook.find("Expression2", gene=["EGFR","BRCA1"], Study_ID= "prad_wcdt");
    assert len(data) == 2
    print "success"

    """
    import json
    print json.dumps(data, sort_keys=True, indent=4, separators=(',', ': '))
    """

test()
