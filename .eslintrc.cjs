module.exports = {
  // Extensión de la configuración base
  extends: [
    'eslint:recommended',
    '@eslint/js/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-refresh/recommended'
  ],
  
  // Configuración del parser
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  
  // Configuración global
  globals: {
    ...require('globals').browser(),
    ...require('globals').es2021()
  },
  
  // Reglas personalizadas
  rules: {
    // Silenciar warnings específicos de dependencias externas
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }
    ],
    
    // Ignorar warnings de deprecaciones de dependencias externas
    'no-restricted-globals': [
      'error',
      {
        name: 'zustand',
        message: 'Zustand warning detected - this is from an external dependency'
      }
    ],
    
    // Permitir console.log para debugging
    'no-console': 'off',
    
    // Configuración para React
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ]
  },
  
  // Ignorar archivos específicos
  ignorePatterns: [
    'dist',
    'build',
    'node_modules',
    '*.config.js',
    '*.config.ts'
  ]
};
