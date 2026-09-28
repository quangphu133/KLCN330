module.exports = {
    extends: ["next/core-web-vitals"],
    plugins: ["import", "react", "jsx-a11y"],
    rules: {
        "import/no-anonymous-default-export": "warn",
        "react/no-unknown-property": "off",
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "jsx-a11y/alt-text": ["warn", { elements: ["img"], img: ["Image"] }],
        "jsx-a11y/aria-props": "warn",
        "jsx-a11y/aria-proptypes": "warn",
        "jsx-a11y/aria-unsupported-elements": "warn",
        "jsx-a11y/role-has-required-aria-props": "warn",
        "jsx-a11y/role-supports-aria-props": "warn",
        "react/jsx-no-target-blank": "off",
        "no-console": ["warn", { allow: ["warn", "error"] }],
        "max-lines": ["warn", { max: 400, skipBlankLines: true, skipComments: true }]
    },
    parserOptions: {
        project: "./tsconfig.json"
    },
    env: {
        browser: true,
        node: true
    },
    ignorePatterns: ["node_modules", ".next", "public", "dist"]
};