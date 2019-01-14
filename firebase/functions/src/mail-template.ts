export const template: string = `
ul
    each value, input in data
        li
            span
                b= \`\${input}: \`
                span= value
`;