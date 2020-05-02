import * as d3 from 'd3';

d3.csv('data/qol.csv')
.then((data:any) => {
    const domains: Array<string> = [];
    const treatments: Array<string> = [];
    const ageGroups: Array<string> = [];
    const baselineGroups: Array<string> = [];

    const months: Array<Number> = [];
    data.columns.forEach((column:string) => {
        if(['Domain', 'Treatment', 'Age range', 'baseline sexual score'].indexOf(column) < 0) {
            months.push(Number(column));
        }
    });
    console.log(months);
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
    const svg = d3.select('#main').append('svg');
    d3.select('nav').selectAll('a')
    .data(domains)
    .enter()
    .append('a')
    .text((d: string) => {
        return d;
    });
    console.log(domains);
});

