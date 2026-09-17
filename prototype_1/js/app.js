// GLOBAL STATE

let crashData = null;
let crashMap = null;
let mapLayer = null;


// LOAD DATA

async function loadData() {

    try {

        const response =
            await fetch(
                "data/crashes.json"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load data/crashes.json"
            );
        }


        crashData =
            await response.json();


        populateFilters();

        initializeMap();

        updateDashboard();


        document
            .getElementById(
                "datasetInfo"
            )
            .textContent =
                ` Source dataset contains ${
                    Number(
                        crashData
                            .metadata
                            .source_records
                    ).toLocaleString()
                } records. `;

    }

    catch (error) {

        console.error(
            "CrashLens data error:",
            error
        );
    }
}


// SORT WARDS

function sortWards(a, b) {

    const unknown =
        "Unknown / not assigned";


    if (a === unknown) {
        return 1;
    }


    if (b === unknown) {
        return -1;
    }


    const numberA =
        Number(
            String(a)
                .replace(
                    "Ward ",
                    ""
                )
        );


    const numberB =
        Number(
            String(b)
                .replace(
                    "Ward ",
                    ""
                )
        );


    return numberA - numberB;
}


// POPULATE FILTERS

function populateFilters() {

    const startYear =
        document.getElementById(
            "startYear"
        );


    const endYear =
        document.getElementById(
            "endYear"
        );


    const wardFilter =
        document.getElementById(
            "wardFilter"
        );


    const years = [

        ...new Set(

            crashData.summary

                .map(
                    row =>
                        row.YEAR_WEB
                )

                .filter(
                    year =>

                        year

                        &&

                        year !==
                        "Unknown / invalid date"

                        &&

                        Number(year) >= 2008

                        &&

                        Number(year) <= 2026
                )
        )

    ].sort(
        (a, b) =>
            Number(a)
            -
            Number(b)
    );


    years.forEach(
        year => {

            const startOption =
                document.createElement(
                    "option"
                );


            startOption.value =
                year;


            startOption.textContent =
                year;


            startYear.appendChild(
                startOption
            );


            const endOption =
                document.createElement(
                    "option"
                );


            endOption.value =
                year;


            endOption.textContent =
                year;


            endYear.appendChild(
                endOption
            );
        }
    );


    startYear.value =
        String(
            years[0]
        );


    endYear.value =
        String(
            years[
                years.length - 1
            ]
        );


    const wards = [

        ...new Set(

            crashData.summary

                .map(
                    row =>
                        row.WARD_CLEAN
                )

                .filter(Boolean)
        )

    ].sort(
        sortWards
    );


    wards.forEach(
        ward => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                ward;


            option.textContent =
                ward;


            wardFilter.appendChild(
                option
            );
        }
    );
}


// GET FILTERS

function getFilters() {

    return {

        startYear:
            Number(
                document
                    .getElementById(
                        "startYear"
                    )
                    .value
            ),

        endYear:
            Number(
                document
                    .getElementById(
                        "endYear"
                    )
                    .value
            ),

        ward:
            document
                .getElementById(
                    "wardFilter"
                )
                .value,

        speeding:
            document
                .getElementById(
                    "speedFilter"
                )
                .value,

        pedestrian:
            document
                .getElementById(
                    "pedestrianFilter"
                )
                .value,

        bicycle:
            document
                .getElementById(
                    "bicycleFilter"
                )
                .value
    };
}


// VALIDATE YEAR RANGE

function validateYearRange(
    changed
) {

    const start =
        document.getElementById(
            "startYear"
        );


    const end =
        document.getElementById(
            "endYear"
        );


    if (
        Number(start.value)
        >
        Number(end.value)
    ) {

        if (
            changed ===
            "start"
        ) {

            end.value =
                start.value;
        }

        else {

            start.value =
                end.value;
        }
    }
}


// FILTER SUMMARY DATA

function getFilteredData() {

    const filters =
        getFilters();


    return crashData.summary.filter(
        row => {

            if (
                !row.YEAR_WEB

                ||

                row.YEAR_WEB ===
                "Unknown / invalid date"
            ) {

                return false;
            }


            const year =
                Number(
                    row.YEAR_WEB
                );


            return (

                year >=
                    filters.startYear

                &&

                year <=
                    filters.endYear

                &&

                (
                    filters.ward ===
                    "all"

                    ||

                    row.WARD_CLEAN ===
                    filters.ward
                )

                &&

                (
                    filters.speeding ===
                    "all"

                    ||

                    row.SPEEDING_FLAG ===
                    filters.speeding
                )

                &&

                (
                    filters.pedestrian ===
                    "all"

                    ||

                    row.PEDESTRIAN_INVOLVED ===
                    filters.pedestrian
                )

                &&

                (
                    filters.bicycle ===
                    "all"

                    ||

                    row.BICYCLE_INVOLVED ===
                    filters.bicycle
                )
            );
        }
    );
}


// FILTER MAP DATA

function getFilteredMapData() {

    const filters =
        getFilters();


    return crashData.map.filter(
        row => {

            if (
                !row.YEAR_WEB

                ||

                row.YEAR_WEB ===
                "Unknown / invalid date"
            ) {

                return false;
            }


            const year =
                Number(
                    row.YEAR_WEB
                );


            return (

                year >=
                    filters.startYear

                &&

                year <=
                    filters.endYear

                &&

                (
                    filters.ward ===
                    "all"

                    ||

                    row.WARD_CLEAN ===
                    filters.ward
                )

                &&

                (
                    filters.speeding ===
                    "all"

                    ||

                    row.SPEEDING_FLAG ===
                    filters.speeding
                )

                &&

                (
                    filters.pedestrian ===
                    "all"

                    ||

                    row.PEDESTRIAN_INVOLVED ===
                    filters.pedestrian
                )

                &&

                (
                    filters.bicycle ===
                    "all"

                    ||

                    row.BICYCLE_INVOLVED ===
                    filters.bicycle
                )
            );
        }
    );
}


// UPDATE KPI

function updateKPIs(data) {

    const crashes =
        data.reduce(
            (sum, row) =>
                sum
                +
                Number(row.crashes),
            0
        );


    const fatalities =
        data.reduce(
            (sum, row) =>
                sum
                +
                Number(row.fatalities),
            0
        );


    const injuries =
        data.reduce(
            (sum, row) =>
                sum
                +
                Number(row.major_injuries),
            0
        );


    document
        .getElementById(
            "totalCrashes"
        )
        .textContent =
            Math
                .round(crashes)
                .toLocaleString();


    document
        .getElementById(
            "totalFatalities"
        )
        .textContent =
            Math
                .round(fatalities)
                .toLocaleString();


    document
        .getElementById(
            "totalMajorInjuries"
        )
        .textContent =
            Math
                .round(injuries)
                .toLocaleString();
}


// UPDATE WARD CHART

function updateWardChart(data) {

    const totals = {};


    data.forEach(
        row => {

            const ward =
                row.WARD_CLEAN;


            totals[ward] =
                (totals[ward] || 0)
                +
                Number(row.crashes);
        }
    );


    const wards =
        Object
            .keys(totals)
            .sort(sortWards);


    const values =
        wards.map(
            ward =>
                totals[ward]
        );


    const colors =
        wards.map(
            ward =>

                ward ===
                "Unknown / not assigned"

                    ? "#98a2b3"

                    : "#147d73"
        );


    Plotly.react(

        "wardChart",

        [
            {
                x: wards,

                y: values,

                type: "bar",

                marker: {
                    color: colors
                },

                hovertemplate:
                    "<b>%{x}</b><br>"
                    +
                    "%{y:,} crashes"
                    +
                    "<extra></extra>"
            }
        ],

        {
            height: 300,

            margin: {
                top: 8,
                right: 15,
                bottom: 75,
                left: 60
            },

            paper_bgcolor:
                "rgba(0,0,0,0)",

            plot_bgcolor:
                "rgba(0,0,0,0)",

            font: {
                family:
                    "Arial, sans-serif",

                color:
                    "#172033",

                size: 12
            },

            xaxis: {
                tickangle: -25,

                automargin: true
            },

            yaxis: {
                title: "Crashes",

                gridcolor:
                    "#e5e7eb",

                zeroline: false,

                automargin: true
            },

            bargap: 0.16,

            showlegend: false
        },

        {
            responsive: true,

            displayModeBar: false
        }
    );
}


// UPDATE INVOLVEMENT CHART

function updateInvolvementChart(
    data
) {

    const pedestrian =
        data
            .filter(
                row =>
                    row.PEDESTRIAN_INVOLVED ===
                    "Yes"
            )
            .reduce(
                (sum, row) =>
                    sum
                    +
                    Number(row.crashes),
                0
            );


    const bicycle =
        data
            .filter(
                row =>
                    row.BICYCLE_INVOLVED ===
                    "Yes"
            )
            .reduce(
                (sum, row) =>
                    sum
                    +
                    Number(row.crashes),
                0
            );


    const speeding =
        data
            .filter(
                row =>
                    row.SPEEDING_FLAG ===
                    "Yes"
            )
            .reduce(
                (sum, row) =>
                    sum
                    +
                    Number(row.crashes),
                0
            );


    Plotly.react(

        "involvementChart",

        [
            {
                x: [
                    "Pedestrian",
                    "Bicycle",
                    "Speeding"
                ],

                y: [
                    pedestrian,
                    bicycle,
                    speeding
                ],

                type: "bar",

                marker: {
                    color: "#7c3aed"
                },

                hovertemplate:
                    "<b>%{x}</b><br>"
                    +
                    "%{y:,} crashes"
                    +
                    "<extra></extra>"
            }
        ],

        {
            height: 300,

            margin: {
                top: 8,
                right: 15,
                bottom: 50,
                left: 60
            },

            paper_bgcolor:
                "rgba(0,0,0,0)",

            plot_bgcolor:
                "rgba(0,0,0,0)",

            font: {
                family:
                    "Arial, sans-serif",

                color:
                    "#172033",

                size: 12
            },

            xaxis: {
                automargin: true
            },

            yaxis: {
                title: "Crashes",

                gridcolor:
                    "#e5e7eb",

                zeroline: false,

                automargin: true
            },

            bargap: 0.20,

            showlegend: false
        },

        {
            responsive: true,

            displayModeBar: false
        }
    );
}


// UPDATE TIME CHART

function updateTimeChart(data) {

    const totals = {};


    data.forEach(
        row => {

            const month =
                row.MONTH_WEB;


            if (
                !month

                ||

                month ===
                "Unknown"
            ) {

                return;
            }


            totals[month] =
                (totals[month] || 0)
                +
                Number(row.crashes);
        }
    );


    const months =
        Object
            .keys(totals)
            .sort();


    const values =
        months.map(
            month =>
                totals[month]
        );


    Plotly.react(

        "timeChart",

        [
            {
                x: months,

                y: values,

                type: "scatter",

                mode: "lines",

                line: {
                    color: "#2563eb",

                    width: 3
                },

                hovertemplate:
                    "<b>%{x}</b><br>"
                    +
                    "%{y:,} crashes"
                    +
                    "<extra></extra>"
            }
        ],

        {
            height: 340,

            margin: {
                top: 8,
                right: 20,
                bottom: 55,
                left: 65
            },

            paper_bgcolor:
                "rgba(0,0,0,0)",

            plot_bgcolor:
                "rgba(0,0,0,0)",

            font: {
                family:
                    "Arial, sans-serif",

                color:
                    "#172033",

                size: 12
            },

            xaxis: {
                title: "Month",

                gridcolor:
                    "#f0f2f5"
            },

            yaxis: {
                title: "Crashes",

                gridcolor:
                    "#e5e7eb",

                zeroline: false
            },

            showlegend: false
        },

        {
            responsive: true,

            displayModeBar: false
        }
    );
}


// INITIALIZE MAP

function initializeMap() {

    crashMap =
        L.map(
            "map",
            {
                preferCanvas: true
            }
        )
        .setView(
            [
                38.9072,
                -77.0369
            ],
            12
        );


    L.tileLayer(

        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",

        {
            maxZoom: 18,

            attribution:
                "Tiles © Esri"
        }

    ).addTo(
        crashMap
    );


    mapLayer =
        L.layerGroup()
            .addTo(
                crashMap
            );


    setTimeout(
        () => {

            crashMap
                .invalidateSize();

        },
        250
    );
}


// UPDATE MAP

function updateMap() {

    if (
        !crashMap
        ||
        !mapLayer
    ) {

        return;
    }


    const data =
        getFilteredMapData();


    const locations = {};


    data.forEach(
        row => {

            const latitude =
                Number(
                    row.LAT_GRID
                );


            const longitude =
                Number(
                    row.LON_GRID
                );


            if (
                !Number.isFinite(
                    latitude
                )

                ||

                !Number.isFinite(
                    longitude
                )
            ) {

                return;
            }


            if (
                latitude < 38.75
                ||
                latitude > 39.05
                ||
                longitude < -77.20
                ||
                longitude > -76.85
            ) {

                return;
            }


            const key =
                `${latitude}|${longitude}`;


            if (
                !locations[key]
            ) {

                locations[key] = {

                    latitude:
                        latitude,

                    longitude:
                        longitude,

                    crashes:
                        0
                };
            }


            locations[key]
                .crashes +=
                    Number(
                        row.crashes
                    );
        }
    );


    const points =
        Object.values(
            locations
        );


    mapLayer.clearLayers();


    if (
        points.length ===
        0
    ) {

        return;
    }


    const maximum =
        Math.max(
            ...points.map(
                point =>
                    point.crashes
            )
        );


    points.forEach(
        point => {

            const radius =

                3

                +

                13

                *

                Math.sqrt(
                    point.crashes
                    /
                    maximum
                );


            L.circleMarker(

                [
                    point.latitude,
                    point.longitude
                ],

                {
                    radius: radius,

                    color:
                        "#2563eb",

                    weight: 1,

                    fillColor:
                        "#2563eb",

                    fillOpacity:
                        0.30
                }

            )

                .bindTooltip(

                    `${
                        point
                            .crashes
                            .toLocaleString()
                    } crashes`

                )

                .addTo(
                    mapLayer
                );
        }
    );


    crashMap.setView(
        [
            38.9072,
            -77.0369
        ],
        12
    );


    setTimeout(
        () => {

            crashMap
                .invalidateSize();

        },
        100
    );
}


// RESIZE CHARTS

function resizeCharts() {

    [
        "wardChart",
        "involvementChart",
        "timeChart"
    ]
    .forEach(
        id => {

            const chart =
                document
                    .getElementById(
                        id
                    );


            if (
                chart
                &&
                chart.data
            ) {

                Plotly.Plots.resize(
                    chart
                );
            }
        }
    );
}


// UPDATE DASHBOARD

function updateDashboard() {

    const data =
        getFilteredData();


    updateKPIs(
        data
    );


    updateWardChart(
        data
    );


    updateInvolvementChart(
        data
    );


    updateTimeChart(
        data
    );


    updateMap();


    setTimeout(
        resizeCharts,
        100
    );
}


// FILTER EVENTS

document
    .getElementById(
        "startYear"
    )
    .addEventListener(
        "change",
        () => {

            validateYearRange(
                "start"
            );

            updateDashboard();
        }
    );


document
    .getElementById(
        "endYear"
    )
    .addEventListener(
        "change",
        () => {

            validateYearRange(
                "end"
            );

            updateDashboard();
        }
    );


[
    "wardFilter",
    "speedFilter",
    "pedestrianFilter",
    "bicycleFilter"
]
.forEach(
    id => {

        document
            .getElementById(
                id
            )
            .addEventListener(
                "change",
                updateDashboard
            );
    }
);


// RESET FILTERS

document
    .getElementById(
        "resetButton"
    )
    .addEventListener(
        "click",
        () => {

            const start =
                document.getElementById(
                    "startYear"
                );


            const end =
                document.getElementById(
                    "endYear"
                );


            start.selectedIndex = 0;


            end.selectedIndex =
                end.options.length - 1;


            document
                .getElementById(
                    "wardFilter"
                )
                .value =
                    "all";


            document
                .getElementById(
                    "speedFilter"
                )
                .value =
                    "all";


            document
                .getElementById(
                    "pedestrianFilter"
                )
                .value =
                    "all";


            document
                .getElementById(
                    "bicycleFilter"
                )
                .value =
                    "all";


            updateDashboard();
        }
    );


// WINDOW RESIZE

window.addEventListener(
    "resize",
    () => {

        resizeCharts();


        if (
            crashMap
        ) {

            crashMap
                .invalidateSize();
        }
    }
);


// START CRASHLENS

loadData();