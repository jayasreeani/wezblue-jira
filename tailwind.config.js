/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        jira: {
          brand: "#0052cc",
          brandHover: "#0747a6",
          brandLight: "#deebff",
          text: "#172b4d",
          subtle: "#5e6c84",
          border: "#dfe1e6",
          bg: "#f4f5f7",
          surface: "#ffffff",
          darker: "#091e42",
        },
        issue: {
          epic: "#8777d9",
          epicBg: "#eae6ff",
          story: "#36b37e",
          storyBg: "#e3fcef",
          task: "#4c9aff",
          taskBg: "#deebff",
          bug: "#ff5630",
          bugBg: "#ffebe6",
        }
      },
    },
  },
  plugins: [],
}
