import * as d3 from 'd3';

d3.csv('data/qol.csv')
.then((data:any) => {
    const domains: Array<string> = [];
    const treatments: Array<string> = [];
    const ageGroups: Array<string> = [];
    const baselineGroups: Array<string> = [];

    const months: Array<string> = [];
    data.columns.forEach((column:string) => {
        if(['Domain', 'Treatment', 'Age range', 'baseline sexual score'].indexOf(column) < 0) {
            months.push(column);
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
    d3.select('nav').selectAll('a')
    .data(domains)
    .enter()
    .append('a')
    .text((d: string) => {
        return d;
    });
    
    let domain = domains[0];

    let width = 500;
    let height = 300;
    let margin = 30;

    const svg = d3.select('#main').append("svg")
        .attr("width", width + margin *2)
        .attr("height", height + margin *2);

    // get lines
    let lines = data.filter((d:any) => {
        return d['Domain'] == domain;
    });
    lines = lines.map((d:any) => {
        return months.map((month) => {
            return {
                'value': d[month],
                'month': Number(month)
            };
        });
    });
    console.log(lines);

    const x = d3.scaleLinear()
        .domain([Number(months[0]), Number(months[months.length - 1])])
        .range([0, width]);
    const y = d3.scaleLinear()
        .domain([100, 0])
        .range([0,height]);

    svg.append("g")
        .attr("transform", `translate(${margin}, ${height+margin})`)
        .call(d3.axisBottom(x));
    svg.append("g")
        .attr("transform", `translate(${margin}, ${margin})`)
        .call(d3.axisLeft(y));
    
    console.log(lines[0]);

    const lineGenerator = d3.line<any>()
        .x((d, i) => {
            return x(d['month']);
        })
        .y((d) => {
            return y(d['value']);
        });

    const chart = svg.append("g")
        .attr('transform', `translate(${margin}, ${margin})`);

    chart.selectAll("path")
        .data(lines)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", (d) => {
            return lineGenerator(d)
        })

});

