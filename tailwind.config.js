export default {
    content: ["./src/**/*.{tsx, ts}"],
    theme: {
        extend: {},
    },
    plugins: [
        ({ matchUtilities }) => {
            matchUtilities(
                {
                    "grid-t-cols": /** @param {string} value */ (value) => {
                        return {
                            "grid-template-columns": value
                        }
                    },
                    "grid-t-rows": /** @param {string} value */ (value) => {
                        return {
                            "grid-template-rows": value
                        }
                    },
                    "grid-a-rows": /** @param {string} value */ (value) => {
                        return {
                            "grid-auto-rows": value
                        }
                    },
                    "grid-a-cols": /** @param {string} value */ (value) => {
                        return {
                            "grid-auto-columns": value
                        }
                    }
                }
            );
        }
    ]
}