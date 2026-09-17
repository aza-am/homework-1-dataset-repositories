# Homework #1 - Dataset Repositories Review

This repository contains the analysis and working web prototypes developed for Homework #1: Review Dataset Repositories.

## Repositories analyzed

1. Open Data DC
2. FiveThirtyEight Data

## Prototype 1 - CrashLens

CrashLens is an interactive dashboard based on the Open Data DC vehicular crash dataset.

The dashboard provides:
- crash KPI indicators;
- year and ward filters;
- geographic crash exploration;
- road-user and risk analysis;
- crash trends over time.

Technologies: HTML, CSS, JavaScript, Plotly, Leaflet.

## Prototype 2 - ScreenEquity

ScreenEquity is an interactive dashboard based on the FiveThirtyEight Bechdel movie dataset.

The dashboard provides:
- total film and Bechdel pass-rate indicators;
- year, decade, and Bechdel result filters;
- representation trends over time;
- financial comparison of PASS and FAIL films;
- budget and worldwide gross analysis.

Technologies: HTML, CSS, JavaScript, Plotly.

## Repository structure

- `prototype_1/` - CrashLens web prototype
  - `analysis/` - Open Data DC analysis and crash data preprocessing notebooks
  - `data/` - processed `crashes.json` used by the dashboard
  - `css/` - dashboard styling
  - `js/` - dashboard logic and visualizations
  - `index.html` - main CrashLens page

- `prototype_2/` - ScreenEquity web prototype
  - `analysis/` - FiveThirtyEight analysis and movie data preprocessing notebooks
  - `data/` - processed `screenequity.json` used by the dashboard
  - `css/` - dashboard styling
  - `js/` - dashboard logic and visualizations
  - `index.html` - main ScreenEquity page

- `.gitignore` - files excluded from version control

## Data preparation

The original datasets were inspected and preprocessed in Google Colab.  
Large raw and cleaned CSV files are not included in this repository. The preprocessing notebooks document the preparation process and can be used to reproduce the processed data.

## Reproducibility

To rerun the preprocessing notebooks, download the original source datasets and upload them to the corresponding Colab runtime before executing the notebooks.

### CrashLens
Source dataset: [Vehicular Crash Data from Open Data DC](https://opendata.dc.gov/datasets/DCGIS::crashes-in-dc/about)  
Expected file name: `Vehicular_Crash_Data.csv`

### ScreenEquity
Source dataset: [Bechdel movie data from FiveThirtyEight Data](https://github.com/fivethirtyeight/data/tree/master/bechdel/movies.csv)
Expected file name: `movies.csv`

The processed JSON files required by the web prototypes are included in the repository.

## Working prototypes

- [CrashLens](https://aza-am.github.io/homework-1-dataset-repositories/prototype_1/)
- [ScreenEquity](https://aza-am.github.io/homework-1-dataset-repositories/prototype_2/)