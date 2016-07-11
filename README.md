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

### Gene sets (.gmt)

GMT files define a set of gene sets. See [here](http://www.broadinstitute.org/cancer/software/genepattern/file-formats-guide#GMT) for the file format definition.

## Importing Data
Some notes on importing data via Wrangler:

- Choose "Create a new submission" via the Wrangler homepage to begin importing data.
- Multiple files may be imported within a single submission. To do this, once a file has been added via one of the import option form fields in the Files section, use the form field again to add another file or files; they will be listed in the "Preview" section with the first file.
- For files of type "Gene expression rectangular matrix", there are two normalization options: "Quantile normalized counts" and "Quantile normalized counts log2(x+1)". The files as received directly from BD2K should use normalization "Quantile normalized counts". When Wrangler processes files with this normalization, it will perform log2(x+1) normalization on the data.
  - If a file has already had log2(x+1) normalization performed on it before being imported into Wrangler, choose normalization option "Quantile normalized counts log2(x+1)" and no further normalization will be performed.
- Wrangler will also remove duplicate gene names from a file. However, the **Gene count** displayed in the Review section is if the original count from the file; if duplicate gene names have been removed the final count will be lower. (See Issue #9)

