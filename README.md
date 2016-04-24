# Wrangler

Wrangler imports several data types into the MedBook database.

## Supported data types

### Sample name definitions

Genomic data cannot be loaded into MedBook without first loading a file telling MedBook that a certain sample name is valid for a study. You can also indicate to MedBook a certain sample name is valid by loading a patient/sample mapping table (see below).

[Here is an example sample name definition file.](/example-files/sample_name_definitions.tsv)

### Patient/sample mapping table

This type of file tells MedBook about a new patient and/or a new sample. Without this mapping file, new data cannot be imported into MedBook.

[Here is an example patient sample mapping file.](/example-files/patient_sample_mapping.tsv)

### Genomic matrices

Several different genomic matrices are supported:
- gene expression
- more are coming soon!

If there are duplicate genes in the a genomic matrix, the values are averaged for all duplicates of that gene. 

[Here is an example of a genomic expression file.](/example-files/genomic_expression_matrix.tsv)
