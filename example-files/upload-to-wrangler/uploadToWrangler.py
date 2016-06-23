#!/usr/bin/python2.7

import ConfigParser
import sys
import os.path
import subprocess

# Python script to export files to, eg, medbook
# see example.conf for usage

# Construct the path to the sample file.
# Expected format is:
# basepath/$sample/innerpath/$sample$suffix
def findSample(options, sample):
  basepath = options["sample_base_directory"]
  innerpath = options["sample_contents_path"]
  suffix = options["sample_suffix"]
  sample_name = "".join([sample, suffix])
  sample_full_path = os.path.join(basepath, sample, innerpath, sample_name)
  if(not os.path.isfile(sample_full_path)):
    raise Exception("Couldn't find sample at path:\n%s" % sample_full_path)
  return sample_full_path

# Upload the sample found at the provided path
# based on the protocol found in options.
# Currently only supports cURL.
def uploadSample(options, sample_path):
  if( options["protocol"] == "curl"):
    sample_filename = os.path.basename(sample_path)
    url_w_filename = "%s%s" % (options["destination_url"], sample_filename)
    curl_command = ["curl", "-k", url_w_filename, "-H", "Content-Type: text/plain", 
                    "-T", sample_path]

    #print subprocess.list2cmdline(curl_command)
    result = subprocess.check_output(curl_command)
    return result
  else:
    raise Exception("Protocol '%s' is unsupported." % options["protocol"])
  return result

def main(config_file, sample):
  parser = ConfigParser.RawConfigParser()
  parser.read(config_file)
  options = dict(parser._sections["options"])
  # Confirm the file exists
  sample_path = findSample(options, sample)
  # Upload it
  blob_id = uploadSample(options, sample_path)
  print "Blob ID for import to Wrangler:\n%s\n" % blob_id

if __name__ == '__main__':
  if len(sys.argv) != 3:
    print ("Usage:\n"
           "uploadToWrangler.py configurationFile sampleID\n"
           "See the README for further details.")
  else:
    main(sys.argv[1], sys.argv[2])
