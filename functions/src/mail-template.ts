export const template: string = `
ul
    each field in fields
        li
            span
                b= \`\${field}: \`
                span= \`{{\${field}}}\`
`;