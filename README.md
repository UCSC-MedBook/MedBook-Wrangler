# Wrangler

Wrangler imports several data types into the MedBook database.

## Supported data types

### Patient/sample mapping table

This type of file tells MedBook about a new patient and/or a new sample.
Without this mapping file, new data cannot be imported into MedBook.

[Here is an example patient sample mapping file.](/example-files/patient_sample_mapping.tsv)

### Genomic matrices

Several different genomic matrices are supported:
- gene expression
- more are coming soon!

[Here is an example of a genomic expression file.](/example-files/genomic_expression_matrix.tsv)
