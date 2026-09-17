// GLOBAL DATA

let movies = [];
let filteredMovies = [];

const MIN_YEAR = 1970;
const MAX_YEAR = 2013;


/* ELEMENTS */

const yearStart = document.getElementById("yearStart");
const yearEnd = document.getElementById("yearEnd");
const decadeFilter = document.getElementById("decadeFilter");
const resultFilter = document.getElementById("resultFilter");
const financialMetric = document.getElementById("financialMetric");
const resetFilters = document.getElementById("resetFilters");

const totalFilms = document.getElementById("totalFilms");
const passRate = document.getElementById("passRate");
const medianBudget = document.getElementById("medianBudget");
const medianGross = document.getElementById("medianGross");

const financialChartTitle =
    document.getElementById("financialChartTitle");


/* LOAD DATA */

async function loadData() {

    try {

        const response = await fetch(
            "data/screenequity.json"
        );

        if (!response.ok) {
            throw new Error(
                `HTTP error ${response.status}`
            );
        }

        movies = await response.json();

        initializeFilters();
        updateDashboard();

    } catch (error) {

        console.error(
            "Could not load ScreenEquity data:",
            error
        );

    }
}


/* INITIALIZE FILTERS */

function initializeFilters() {

    for (
        let year = MIN_YEAR;
        year <= MAX_YEAR;
        year++
    ) {

        const startOption =
            document.createElement("option");

        startOption.value = year;
        startOption.textContent = year;

        yearStart.appendChild(startOption);


        const endOption =
            document.createElement("option");

        endOption.value = year;
        endOption.textContent = year;

        yearEnd.appendChild(endOption);
    }

    yearStart.value = MIN_YEAR;
    yearEnd.value = MAX_YEAR;


    const decades = [
        "1970s",
        "1980s",
        "1990s",
        "2000s",
        "2010s"
    ];

    decades.forEach(decade => {

        const option =
            document.createElement("option");

        option.value = decade;
        option.textContent = decade;

        decadeFilter.appendChild(option);

    });
}


/* FILTER DATA */

function applyFilters() {

    let start =
        Number(yearStart.value);

    let end =
        Number(yearEnd.value);


    if (start > end) {

        const temp = start;

        start = end;
        end = temp;

        yearStart.value = start;
        yearEnd.value = end;
    }


    filteredMovies = movies.filter(movie => {

        const movieYear =
            Number(movie.year);

        if (
            movieYear < start ||
            movieYear > end
        ) {
            return false;
        }


        if (
            decadeFilter.value !== "all" &&
            movie.DECADE !== decadeFilter.value
        ) {
            return false;
        }


        if (
            resultFilter.value !== "all" &&
            movie.BECHDEL_RESULT !==
                resultFilter.value
        ) {
            return false;
        }


        return true;
    });
}


/* HELPERS */

function validNumbers(data, field) {

    return data
        .map(item => Number(item[field]))
        .filter(value =>
            Number.isFinite(value)
        );
}


function median(values) {

    if (!values.length) {
        return null;
    }

    const sorted = [...values]
        .sort((a, b) => a - b);

    const middle =
        Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {

        return (
            sorted[middle - 1] +
            sorted[middle]
        ) / 2;
    }

    return sorted[middle];
}


function formatInteger(value) {

    return new Intl.NumberFormat(
        "en-US"
    ).format(value);
}


function formatCurrency(value) {

    if (
        value === null ||
        !Number.isFinite(value)
    ) {
        return "—";
    }


    if (
        Math.abs(value) >= 1_000_000_000
    ) {

        return (
            "$" +
            (value / 1_000_000_000)
                .toFixed(1) +
            "B"
        );
    }


    if (
        Math.abs(value) >= 1_000_000
    ) {

        return (
            "$" +
            (value / 1_000_000)
                .toFixed(1) +
            "M"
        );
    }


    if (
        Math.abs(value) >= 1_000
    ) {

        return (
            "$" +
            (value / 1_000)
                .toFixed(1) +
            "K"
        );
    }


    return "$" + value.toFixed(0);
}


/* KPI */

function updateKPIs() {

    const total =
        filteredMovies.length;

    const passes =
        filteredMovies.filter(
            movie =>
                movie.BECHDEL_RESULT ===
                "PASS"
        ).length;


    const rate =
        total > 0
            ? (passes / total) * 100
            : 0;


    const budgetMedian =
        median(
            validNumbers(
                filteredMovies,
                "budget_2013$"
            )
        );


    const grossMedian =
        median(
            validNumbers(
                filteredMovies,
                "intgross_2013$"
            )
        );


    totalFilms.textContent =
        formatInteger(total);

    passRate.textContent =
        rate.toFixed(1) + "%";

    medianBudget.textContent =
        formatCurrency(budgetMedian);

    medianGross.textContent =
        formatCurrency(grossMedian);
}


/* PASS RATE CHART */

function drawPassRateChart() {

    const years = [];

    for (
        let year = MIN_YEAR;
        year <= MAX_YEAR;
        year++
    ) {

        const yearMovies =
            filteredMovies.filter(
                movie =>
                    Number(movie.year) === year
            );


        if (!yearMovies.length) {
            continue;
        }


        const passes =
            yearMovies.filter(
                movie =>
                    movie.BECHDEL_RESULT ===
                    "PASS"
            ).length;


        years.push({
            year: year,
            rate:
                passes /
                yearMovies.length *
                100
        });
    }


    const trace = {

        x: years.map(
            item => item.year
        ),

        y: years.map(
            item => item.rate
        ),

        type: "scatter",
        mode: "lines+markers",

        line: {
            color: "#8a3ffc",
            width: 3
        },

        marker: {
            color: "#8a3ffc",
            size: 6
        },

        hovertemplate:
            "<b>%{x}</b><br>" +
            "Pass rate: %{y:.1f}%" +
            "<extra></extra>"
    };


    const layout = {

        margin: {
            l: 55,
            r: 20,
            t: 20,
            b: 45
        },

        paper_bgcolor:
            "rgba(0,0,0,0)",

        plot_bgcolor:
            "rgba(0,0,0,0)",

        xaxis: {
            title: "Year",
            gridcolor: "#edf0f5"
        },

        yaxis: {
            title: "Pass rate (%)",
            range: [0, 100],
            gridcolor: "#edf0f5"
        },

        showlegend: false,

        font: {
            family:
                "Inter, sans-serif",
            color: "#667085"
        }
    };


    Plotly.react(
        "passRateChart",
        [trace],
        layout,
        {
            responsive: true,
            displayModeBar: false
        }
    );
}


/* FINANCIAL COMPARISON */

function drawFinancialChart() {

    const field =
        financialMetric.value;


    const labels = {

        "budget_2013$":
            "Median budget",

        "domgross_2013$":
            "Median domestic gross",

        "intgross_2013$":
            "Median worldwide gross",

        "PROFIT_2013":
            "Median profit"
    };


    financialChartTitle.textContent =
        labels[field];


    const results = [
        "PASS",
        "FAIL"
    ];


    const values =
        results.map(result => {

            const group =
                filteredMovies.filter(
                    movie =>
                        movie.BECHDEL_RESULT ===
                        result
                );

            return median(
                validNumbers(
                    group,
                    field
                )
            ) || 0;
        });


    const trace = {

        x: results,
        y: values,

        type: "bar",

        marker: {
            color: [
                "#8a3ffc",
                "#c4b5fd"
            ]
        },

        hovertemplate:
            "<b>%{x}</b><br>" +
            "$%{y:,.0f}" +
            "<extra></extra>"
    };


    const layout = {

        margin: {
            l: 70,
            r: 20,
            t: 20,
            b: 45
        },

        paper_bgcolor:
            "rgba(0,0,0,0)",

        plot_bgcolor:
            "rgba(0,0,0,0)",

        yaxis: {
            title: "2013, USD",
            gridcolor: "#edf0f5"
        },

        xaxis: {
            title: "Bechdel result"
        },

        showlegend: false,

        font: {
            family:
                "Inter, sans-serif",
            color: "#667085"
        }
    };


    Plotly.react(
        "financialChart",
        [trace],
        layout,
        {
            responsive: true,
            displayModeBar: false
        }
    );
}


/* SCATTER */

function drawScatterChart() {

    const passMovies =
        filteredMovies.filter(movie =>
            movie.BECHDEL_RESULT === "PASS" &&
            Number.isFinite(
                Number(
                    movie["budget_2013$"]
                )
            ) &&
            Number.isFinite(
                Number(
                    movie["intgross_2013$"]
                )
            )
        );


    const failMovies =
        filteredMovies.filter(movie =>
            movie.BECHDEL_RESULT === "FAIL" &&
            Number.isFinite(
                Number(
                    movie["budget_2013$"]
                )
            ) &&
            Number.isFinite(
                Number(
                    movie["intgross_2013$"]
                )
            )
        );


    const createTrace = (
        data,
        result,
        color
    ) => ({

        x: data.map(
            movie =>
                Number(
                    movie["budget_2013$"]
                )
        ),

        y: data.map(
            movie =>
                Number(
                    movie["intgross_2013$"]
                )
        ),

        text: data.map(
            movie =>
                movie.TITLE_CLEAN
        ),

        customdata: data.map(
            movie =>
                movie.year
        ),

        type: "scatter",
        mode: "markers",

        name: result,

        marker: {
            color: color,
            size: 8,
            opacity: 0.68
        },

        hovertemplate:
            "<b>%{text}</b><br>" +
            "Year: %{customdata}<br>" +
            "Budget: $%{x:,.0f}<br>" +
            "Worldwide gross: $%{y:,.0f}" +
            "<extra></extra>"
    });


    const traces = [

        createTrace(
            passMovies,
            "PASS",
            "#8a3ffc"
        ),

        createTrace(
            failMovies,
            "FAIL",
            "#9aa4b2"
        )

    ];


    const layout = {

        margin: {
            l: 80,
            r: 25,
            t: 15,
            b: 65
        },

        paper_bgcolor:
            "rgba(0,0,0,0)",

        plot_bgcolor:
            "rgba(0,0,0,0)",

        xaxis: {
            title:
                "Budget (2013, USD)",
            gridcolor: "#edf0f5"
        },

        yaxis: {
            title:
                "Worldwide gross (2013, USD)",
            gridcolor: "#edf0f5"
        },

        legend: {
            orientation: "h",
            y: 1.08
        },

        font: {
            family:
                "Inter, sans-serif",
            color: "#667085"
        }
    };


    Plotly.react(
        "scatterChart",
        traces,
        layout,
        {
            responsive: true,
            displayModeBar: false
        }
    );
}


/* TOP FILMS */

function drawTopFilmsChart() {

    const valid =
        filteredMovies
            .filter(movie =>
                Number.isFinite(
                    Number(
                        movie[
                            "intgross_2013$"
                        ]
                    )
                )
            )
            .sort(
                (a, b) =>
                    Number(
                        b[
                            "intgross_2013$"
                        ]
                    ) -
                    Number(
                        a[
                            "intgross_2013$"
                        ]
                    )
            )
            .slice(0, 10)
            .reverse();


    const trace = {

        x: valid.map(
            movie =>
                Number(
                    movie[
                        "intgross_2013$"
                    ]
                )
        ),

        y: valid.map(
            movie =>
                movie.TITLE_CLEAN
        ),

        customdata: valid.map(
            movie => [
                movie.year,
                movie.BECHDEL_RESULT
            ]
        ),

        type: "bar",
        orientation: "h",

        marker: {
            color: valid.map(
                movie =>
                    movie.BECHDEL_RESULT ===
                    "PASS"
                        ? "#8a3ffc"
                        : "#9aa4b2"
            )
        },

        hovertemplate:
            "<b>%{y}</b><br>" +
            "Year: %{customdata[0]}<br>" +
            "Result: %{customdata[1]}<br>" +
            "Worldwide gross: $%{x:,.0f}" +
            "<extra></extra>"
    };


    const layout = {

        margin: {
            l: 180,
            r: 25,
            t: 15,
            b: 55
        },

        paper_bgcolor:
            "rgba(0,0,0,0)",

        plot_bgcolor:
            "rgba(0,0,0,0)",

        xaxis: {
            title:
                "Worldwide gross (2013, USD)",
            gridcolor: "#edf0f5"
        },

        yaxis: {
            automargin: true
        },

        showlegend: false,

        font: {
            family:
                "Inter, sans-serif",
            color: "#667085"
        }
    };


    Plotly.react(
        "topFilmsChart",
        [trace],
        layout,
        {
            responsive: true,
            displayModeBar: false
        }
    );
}


/* UPDATE DASHBOARD */

function updateDashboard() {

    applyFilters();

    updateKPIs();
    drawPassRateChart();
    drawFinancialChart();
    drawScatterChart();
    drawTopFilmsChart();
}


/* EVENTS */

yearStart.addEventListener(
    "change",
    updateDashboard
);

yearEnd.addEventListener(
    "change",
    updateDashboard
);

decadeFilter.addEventListener(
    "change",
    updateDashboard
);

resultFilter.addEventListener(
    "change",
    updateDashboard
);

financialMetric.addEventListener(
    "change",
    updateDashboard
);


resetFilters.addEventListener(
    "click",
    () => {

        yearStart.value =
            MIN_YEAR;

        yearEnd.value =
            MAX_YEAR;

        decadeFilter.value =
            "all";

        resultFilter.value =
            "all";

        financialMetric.value =
            "intgross_2013$";

        updateDashboard();
    }
);


/* RESIZE */

window.addEventListener(
    "resize",
    () => {

        [
            "passRateChart",
            "financialChart",
            "scatterChart",
            "topFilmsChart"
        ].forEach(id => {

            const element =
                document.getElementById(id);

            if (element) {
                Plotly.Plots.resize(
                    element
                );
            }
        });

    }
);


/* START */

loadData();