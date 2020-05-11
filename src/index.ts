import * as d3 from 'd3';
import { line } from 'd3';

d3.csv('data/qol.csv')
.then((data:any) => {
    const domains: Array<string> = [];
    const treatments: Array<string> = [];
    const ageGroups: Array<string> = [];
    const baselineGroups: Array<string> = [];

    let currentDomain: string;
    let viewableMonths: Array<Number>;

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
    viewableMonths = months;

    d3.select('nav').selectAll('a')
    .data(domains)
    .enter()
    .append('a')
    .text((d: string) => {
        return d;
    })
    .on('click', function(d) {
        currentDomain = d;
        drawChart(currentDomain, viewableMonths);
    });

    d3.select('fieldset.months')
    .selectAll('label')
    .data(months)
    .enter()
    .append('label')
    .text((d) => {
        return String(d);
    })
    .append('input')
    .attr('type', 'checkbox')
    .attr('checked', 'checked')
    .on('change', (d) => {
        const dIndex = viewableMonths.indexOf(d);
        if(dIndex === -1) {
            viewableMonths.push(d);
        } else {
            viewableMonths.splice(dIndex, 1);
        }
        drawChart(currentDomain, viewableMonths);
    })

    let width = 500;
    let height = 300;
    let margin = 30;
    const svg = d3.select('#main').append("svg")
        .attr("width", width + margin *2)
        .attr("height", height + margin *2);
    let x = d3.scaleLinear()
        .domain([Number(months[0]), Number(months[months.length - 1])])
        .range([0, width]);

    const xAxis = svg.append("g")
        .attr("transform", `translate(${margin}, ${height+margin})`)
    const yAxis = svg.append("g")
        .attr("transform", `translate(${margin}, ${margin})`)
    const chart = svg.append("g")
        .attr('transform', `translate(${margin}, ${margin})`);

    function drawChart(domain: string, _months: Array<Number>) {
        const minMonth = Number(d3.min(_months));
        const maxMonth = Number(d3.max(_months));

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
            return d['Domain'] == domain;
        }).map((d:any) => {
            return months.map((month) => {
                return {
                    'value': d[String(month)],
                    'month': month,
                    'domain': d['Domain'],
                    'age': d['Age range']
                };
            });
        })
        .map((d:any) => {
            return lineGenerator(d);
        });

        chart.selectAll("path")
        .remove();

        chart.selectAll("path")
            .data(lines)
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", (d) => {
                return d;
            });
    }

    drawChart(currentDomain, viewableMonths);

});

