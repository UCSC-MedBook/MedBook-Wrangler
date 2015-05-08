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


    def find(self, collName):
        try:
            headers = {"X-Auth-Token": self.credentials["authToken"], "X-User-Id": self.credentials["userId"]};
            res = requests.get(self.server + "/data/api/" + collName, headers=headers).json()["data"];
            return res;
        except:
            return None

    def findGenes(self, collName, genes):
        try:
            headers = {"X-Auth-Token": self.credentials["authToken"], "X-User-Id": self.credentials["userId"]};
            if isinstance(genes, list):
                genes = ",".join(genes);
            print genes
            params = dict(gene=genes) 
            
            res = requests.get(self.server + "/data/api/" + collName, params=params, headers=headers).json()["data"];
            return res;
        except:
            return None




medbook = MedBookConnection();
if len(sys.argv) > 2:
    data = medbook.findGenes(sys.argv[1], sys.argv[2].split(","));
else:
    data = medbook.find(sys.argv[1]);

import json
print json.dumps(data, sort_keys=True, indent=4, separators=(',', ': '))

