# Sample Import Files for NxtHire

This folder contains sample CSV files you can use as templates for bulk importing data into the NxtHire admin panel.

## Files

1. **main-sheet-import.csv** — Import candidates/interviews into the Main Sheet
2. **interviewers-import.csv** — Bulk import interviewers
3. **authorize-students-import.csv** — Import students for public booking authorization

## How to use

1. Open the relevant CSV file
2. Replace the dummy data with your real data (keep the header row intact)
3. Save as .csv or .xlsx
4. Go to the corresponding admin page and click the Import button
5. Upload your file

## Notes

- Do NOT change the header names (column names in row 1)
- All dates should be in YYYY-MM-DD or MM/DD/YYYY format
- For the interviewers file, `domains` should be comma-separated (e.g., MERN,PYTHON)
- Valid domains: MERN, JAVA, PYTHON, DA, QA, DSA, OTHER
