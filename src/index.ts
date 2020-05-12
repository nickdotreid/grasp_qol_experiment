import * as d3 from 'd3';

d3.csv('data/qol.csv')
.then((data:any) => {
    const domains: Array<string> = [];
    const treatments: Array<string> = [];
    const ageGroups: Array<string> = [];
    const baselineGroups: Array<string> = [];

    let currentDomain: string;
    let viewableMonths: Array<Number>;
    let viewableAgeGroups: Array<string>;
    let viewableTreatments: Array<string>;
    let viewableBaselineGroups: Array<string>

    const months: Array<Number> = [];
    
    data.columns.forEach((column:string) => {
        if(['Domain', 'Treatment', 'Age range', 'baseline sexual score'].indexOf(column) < 0) {
            months.push(Number(column));
        }
    });
    data.forEach((element:any) => {
        if(element['Domain'] && domains.indexOf(element['Domain']) < 0) {
            domains.push(element['Domain']);
        }
        if(element['Treatment'] && treatments.indexOf(element['Treatment']) < 0) {
            treatments.push(element['Treatment']);
        }
        if(element['Age range'] && ageGroups.indexOf(element['Age range']) < 0) {
            ageGroups.push(element['Age range']);
        }
        if(element['baseline sexual score'] && baselineGroups.indexOf(element['baseline sexual score']) < 0) {
            baselineGroups.push(element['baseline sexual score']);
        }
    });

    currentDomain = domains[0];
    viewableMonths = months.slice();
    viewableBaselineGroups = baselineGroups.slice();
    viewableAgeGroups = ageGroups.slice();
    viewableTreatments = treatments.slice();

    d3.select('nav').selectAll('a')
    .data(domains)
    .enter()
    .append('a')
    .text((d: string) => {
        return d;
    })
    .on('click', function(d) {
        currentDomain = d;
        drawChart();
    });

    drawNavigation("Months", months, (updatedMonths: Number[]) => {
        viewableMonths = updatedMonths;
        drawChart();
    })

    drawNavigation("Age Range", ageGroups, (updated) => {
        viewableAgeGroups = updated;
        drawChart();
    });

    drawNavigation("Treatments", treatments, (updated) => {
        viewableTreatments = updated;
        drawChart();
    });

    drawNavigation("Baseline", baselineGroups, (updated) => {
        viewableBaselineGroups = updated;
        drawChart();
    });

    function drawNavigation(label: String, data: Array<any>, updateCallback: Function) {
        const fieldset = d3.select('form')
        .append('fieldset');

        fieldset.append('legend')
        .text(String(label));

        const selectedData = data.slice();

        fieldset.selectAll('label')
        .data(data)
        .enter()
        .append('label')
        .text((d) => {
            return String(d);
        })
        .append('input')
        .attr('type', 'checkbox')
        .attr('checked', 'checked')
        .on('change', (d) => {
            const dIndex = selectedData.indexOf(d);
            if(dIndex === -1) {
                selectedData.push(d);
            } else {
                selectedData.splice(dIndex, 1);
            }
            updateCallback(selectedData);
        })
    }

    let width = 500;
    let height = 300;
    let margin = 30;
    const svg = d3.select('#main').append("svg")
        .attr("width", width + margin *2)
        .attr("height", height + margin *2);
    const xAxis = svg.append("g")
        .attr("transform", `translate(${margin}, ${height+margin})`)
    const yAxis = svg.append("g")
        .attr("transform", `translate(${margin}, ${margin})`)
    const chart = svg.append("g")
        .attr('transform', `translate(${margin}, ${margin})`);

    function drawChart() {
        const minMonth = Number(d3.min(viewableMonths));
        const maxMonth = Number(d3.max(viewableMonths));

        const _months = months.filter((_month) => {
            return (_month >= minMonth) && (_month <= maxMonth);
        });
        _months.sort((a, b) => {
            if (a > b) {
                return 1;
            } else {
                return -1;
            }
        });

        const x = d3.scaleLinear()
            .domain([minMonth, maxMonth])
            .range([0, width]);
        const y = d3.scaleLinear()
            .domain([100, 0])
            .range([0,height]);
        const lineGenerator = d3.line<any>()
        .x((d) => {
            return x(d['month']);
        })
        .y((d) => {
            return y(d['value']);
        });

        xAxis.call(d3.axisBottom(x));
        yAxis.call(d3.axisLeft(y));

        const lines = data.filter((d:any) => {
            if (d['Domain'] !== currentDomain) {
                return false;
            }
            if(viewableAgeGroups.indexOf(d['Age range']) === -1) {
                return false;
            }
            if (viewableBaselineGroups.indexOf(d['baseline sexual score']) === -1) {
                return false;
            }
            if (viewableTreatments.indexOf(d['Treatment']) === -1) {
                return false;
            }
            return true;
        }).map((d:any) => {
            return _months.map((month) => {
                return {
                    'value': d[String(month)],
                    'month': month,
                    'domain': d['Domain'],
                    'age': d['Age range']
                };
            });
        });

        console.log(lines);

        chart.selectAll("path").remove();

        chart.selectAll("path")
            .data(lines)
        .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("class", "line")
        .exit()
            .remove();

        chart.selectAll("path")
        .attr("d", (d) => {
            return lineGenerator(d);
        });
    }

    drawChart();

});

